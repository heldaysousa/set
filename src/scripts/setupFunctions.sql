-- Função para sincronizar agendamento com Calendly
CREATE OR REPLACE FUNCTION sync_calendly_event()
RETURNS trigger AS $$
BEGIN
  PERFORM net.http_post(
    'https://api.calendly.com/scheduled_events',
    jsonb_build_object(
      'event_type': 'appointment',
      'start_time': NEW.data,
      'end_time': NEW.data + (NEW.duracao || ' minutes')::interval,
      'invitee': jsonb_build_object(
        'name': (SELECT nome FROM clients WHERE id = NEW.client_id),
        'email': (SELECT email FROM clients WHERE id = NEW.client_id)
      ),
      'location': (SELECT endereco FROM business_settings LIMIT 1)
    )::text,
    'application/json',
    ARRAY[
      ('Authorization', 'Bearer ' || (SELECT calendly_token FROM business_settings LIMIT 1))
    ]
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para Calendly
CREATE TRIGGER sync_calendly_trigger
  AFTER INSERT ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION sync_calendly_event();

-- Função para enviar notificação Firebase
CREATE OR REPLACE FUNCTION send_firebase_notification()
RETURNS trigger AS $$
DECLARE
  client_token text;
  professional_token text;
BEGIN
  -- Busca tokens dos dispositivos
  SELECT firebase_uid INTO client_token FROM clients WHERE id = NEW.client_id;
  SELECT firebase_uid INTO professional_token FROM professionals WHERE id = NEW.professional_id;
  
  -- Envia notificação
  PERFORM net.http_post(
    'https://fcm.googleapis.com/v1/projects/' || 
    (SELECT firebase_config->>'projectId' FROM business_settings LIMIT 1) ||
    '/messages:send',
    jsonb_build_object(
      'message', jsonb_build_object(
        'token', client_token,
        'notification', jsonb_build_object(
          'title', 'Agendamento Confirmado',
          'body', 'Seu agendamento foi confirmado para ' || to_char(NEW.data, 'DD/MM/YYYY HH24:MI')
        )
      )
    )::text,
    'application/json'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para Firebase
CREATE TRIGGER send_notification_trigger
  AFTER INSERT OR UPDATE OF status ON appointments
  FOR EACH ROW
  WHEN (NEW.status = 'confirmado')
  EXECUTE FUNCTION send_firebase_notification();

-- Função para cache de métricas no Redis
CREATE OR REPLACE FUNCTION cache_dashboard_metrics(
  business_id uuid,
  date_start timestamp,
  date_end timestamp
) RETURNS jsonb AS $$
DECLARE
  cache_key text;
  metrics jsonb;
BEGIN
  -- Gera chave de cache
  cache_key := 'metrics:' || business_id || ':' || to_char(date_start, 'YYYYMMDD');
  
  -- Tenta buscar do cache
  SELECT value::jsonb INTO metrics
  FROM redis_cache
  WHERE key = cache_key;
  
  -- Se não encontrou no cache, calcula e armazena
  IF metrics IS NULL THEN
    WITH calculated_metrics AS (
      SELECT
        count(*) as total_appointments,
        sum(valor) as total_revenue,
        avg(valor) as average_ticket,
        count(DISTINCT client_id) as total_clients
      FROM appointments
      WHERE 
        business_id = $1
        AND data BETWEEN date_start AND date_end
        AND status = 'concluido'
    )
    SELECT jsonb_build_object(
      'total_appointments', total_appointments,
      'total_revenue', total_revenue,
      'average_ticket', average_ticket,
      'total_clients', total_clients,
      'cached_at', now()
    ) INTO metrics
    FROM calculated_metrics;
    
    -- Armazena no cache
    INSERT INTO redis_cache (key, value)
    VALUES (cache_key, metrics::text)
    ON CONFLICT (key) DO UPDATE
    SET value = EXCLUDED.value;
  END IF;
  
  RETURN metrics;
END;
$$ LANGUAGE plpgsql;

-- Função para logging de eventos
CREATE OR REPLACE FUNCTION log_business_event(
  p_business_id uuid,
  p_event_type text,
  p_event_data jsonb
) RETURNS uuid AS $$
DECLARE
  v_log_id uuid;
BEGIN
  -- Registra no ClickHouse via Foreign Data Wrapper
  INSERT INTO clickhouse_events (
    business_id,
    event_type,
    event_data,
    event_time
  ) VALUES (
    p_business_id,
    p_event_type,
    p_event_data,
    now()
  );
  
  -- Registra localmente para backup
  INSERT INTO event_logs (
    business_id,
    event_type,
    event_data
  ) VALUES (
    p_business_id,
    p_event_type,
    p_event_data
  )
  RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql;

-- Função para análise de métricas
CREATE OR REPLACE FUNCTION analyze_business_metrics(
  p_business_id uuid,
  p_start_date timestamp,
  p_end_date timestamp
) RETURNS jsonb AS $$
DECLARE
  v_metrics jsonb;
BEGIN
  -- Tenta buscar do cache
  v_metrics := cache_dashboard_metrics(p_business_id, p_start_date, p_end_date);
  
  -- Se não encontrou no cache, calcula
  IF v_metrics IS NULL THEN
    WITH metrics AS (
      SELECT
        count(*) as total_appointments,
        count(DISTINCT client_id) as total_clients,
        sum(CASE WHEN status = 'concluido' THEN valor ELSE 0 END) as revenue,
        count(CASE WHEN status = 'cancelado' THEN 1 END)::float / 
          nullif(count(*), 0) * 100 as cancellation_rate,
        array_agg(DISTINCT extract(dow from data)) as busy_days,
        mode() WITHIN GROUP (ORDER BY extract(hour from data)) as peak_hour
      FROM appointments
      WHERE 
        business_id = p_business_id
        AND data BETWEEN p_start_date AND p_end_date
    )
    SELECT jsonb_build_object(
      'total_appointments', total_appointments,
      'total_clients', total_clients,
      'revenue', revenue,
      'cancellation_rate', round(cancellation_rate::numeric, 2),
      'busy_days', busy_days,
      'peak_hour', peak_hour,
      'calculated_at', now()
    ) INTO v_metrics
    FROM metrics;
    
    -- Registra métricas para análise histórica
    PERFORM log_business_event(
      p_business_id,
      'metrics_calculated',
      v_metrics
    );
  END IF;
  
  RETURN v_metrics;
END;
$$ LANGUAGE plpgsql;

-- Função para calcular comissão
CREATE OR REPLACE FUNCTION calculate_commission()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'completed' THEN
        INSERT INTO commissions (
            business_id,
            professional_id,
            appointment_id,
            service_id,
            amount,
            percentage,
            status
        )
        SELECT
            NEW.business_id,
            NEW.professional_id,
            NEW.id,
            NEW.service_id,
            (NEW.total_amount * s.commission_rate / 100),
            s.commission_rate,
            'pending'
        FROM services s
        WHERE s.id = NEW.service_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para calcular comissão após appointment
CREATE TRIGGER after_appointment_complete
    AFTER UPDATE ON appointments
    FOR EACH ROW
    WHEN (OLD.status IS DISTINCT FROM NEW.status AND NEW.status = 'completed')
    EXECUTE FUNCTION calculate_commission();

-- Função para atualizar métricas do cliente
CREATE OR REPLACE FUNCTION update_client_metrics()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'completed' THEN
        UPDATE clients
        SET 
            total_visits = total_visits + 1,
            last_visit = NEW.data,
            lifetime_value = lifetime_value + NEW.total_amount
        WHERE id = NEW.client_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar métricas do cliente
CREATE TRIGGER after_appointment_update
    AFTER UPDATE ON appointments
    FOR EACH ROW
    WHEN (OLD.status IS DISTINCT FROM NEW.status AND NEW.status = 'completed')
    EXECUTE FUNCTION update_client_metrics();

-- Função para atualizar estoque de produtos
CREATE OR REPLACE FUNCTION update_product_stock()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE products
    SET stock = stock - NEW.quantity
    WHERE id = NEW.product_id;
    
    -- Verifica estoque mínimo
    IF (SELECT stock FROM products WHERE id = NEW.product_id) <= minimum_stock THEN
        INSERT INTO integration_logs (
            integration,
            event,
            status,
            details
        ) VALUES (
            'inventory',
            'low_stock_alert',
            'warning',
            jsonb_build_object(
                'product_id', NEW.product_id,
                'current_stock', (SELECT stock FROM products WHERE id = NEW.product_id),
                'minimum_stock', (SELECT minimum_stock FROM products WHERE id = NEW.product_id)
            )
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar estoque
CREATE TRIGGER after_product_sale
    AFTER INSERT ON product_sales
    FOR EACH ROW
    EXECUTE FUNCTION update_product_stock();

-- Função para calcular métricas diárias
CREATE OR REPLACE FUNCTION calculate_daily_metrics()
RETURNS void AS $$
DECLARE
    v_date date := current_date - interval '1 day';
    v_total_appointments integer;
    v_total_revenue numeric(10,2);
    v_total_expenses numeric(10,2);
    v_new_clients integer;
BEGIN
    -- Calcula métricas
    SELECT 
        COUNT(*),
        COALESCE(SUM(total_amount), 0)
    INTO 
        v_total_appointments,
        v_total_revenue
    FROM appointments
    WHERE date_trunc('day', data) = v_date
    AND status = 'completed';
    
    SELECT COALESCE(SUM(amount), 0)
    INTO v_total_expenses
    FROM expenses
    WHERE date_trunc('day', date) = v_date;
    
    SELECT COUNT(*)
    INTO v_new_clients
    FROM clients
    WHERE date_trunc('day', created_at) = v_date;
    
    -- Insere métricas
    INSERT INTO metrics_history (
        date,
        total_appointments,
        total_revenue,
        average_ticket,
        conversion_rate,
        customer_satisfaction
    ) VALUES (
        v_date,
        v_total_appointments,
        v_total_revenue,
        CASE 
            WHEN v_total_appointments > 0 THEN v_total_revenue / v_total_appointments
            ELSE 0
        END,
        CASE 
            WHEN v_total_appointments > 0 THEN 
                (SELECT COUNT(*)::float / v_total_appointments 
                 FROM appointments 
                 WHERE date_trunc('day', data) = v_date 
                 AND status = 'completed')
            ELSE 0
        END,
        (SELECT AVG(rating)
         FROM appointments
         WHERE date_trunc('day', data) = v_date
         AND rating IS NOT NULL)
    );
END;
$$ LANGUAGE plpgsql;

-- Agenda job para calcular métricas diárias
SELECT cron.schedule(
    'calculate-daily-metrics',
    '0 1 * * *',  -- Executa todo dia à 1h da manhã
    $$
    SELECT calculate_daily_metrics();
    $$
);

-- Função para busca fuzzy de clientes
CREATE OR REPLACE FUNCTION search_clients(search_term text)
RETURNS TABLE (
    id uuid,
    nome text,
    email text,
    telefone text,
    similarity float
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id,
        c.nome,
        c.email,
        c.telefone,
        similarity(unaccent(lower(c.nome)), unaccent(lower(search_term))) as similarity
    FROM clients c
    WHERE 
        similarity(unaccent(lower(c.nome)), unaccent(lower(search_term))) > 0.3
        OR c.nome ILIKE '%' || search_term || '%'
        OR c.email ILIKE '%' || search_term || '%'
        OR c.telefone ILIKE '%' || search_term || '%'
    ORDER BY similarity DESC, c.nome;
END;
$$ LANGUAGE plpgsql;

-- Função para obter estatísticas do cliente
CREATE OR REPLACE FUNCTION get_client_stats(client_id UUID)
RETURNS TABLE (
  total_appointments BIGINT,
  total_spent DECIMAL,
  favorite_service TEXT,
  favorite_professional TEXT,
  last_visit TIMESTAMP,
  avg_ticket DECIMAL
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH stats AS (
    SELECT
      COUNT(*) as total_appointments,
      SUM(ch.value) as total_spent,
      MAX(ch.date) as last_visit,
      ROUND(AVG(ch.value), 2) as avg_ticket,
      -- Serviço mais frequente
      FIRST_VALUE(s.name) OVER (
        PARTITION BY ch.client_id
        ORDER BY COUNT(*) DESC
      ) as favorite_service,
      -- Profissional mais frequente
      FIRST_VALUE(p.name) OVER (
        PARTITION BY ch.client_id
        ORDER BY COUNT(*) DESC
      ) as favorite_professional
    FROM client_history ch
    JOIN services s ON s.id = ch.service_id
    JOIN professionals p ON p.id = ch.professional_id
    WHERE ch.client_id = $1
    GROUP BY ch.client_id, s.name, p.name
  )
  SELECT
    total_appointments,
    total_spent,
    favorite_service,
    favorite_professional,
    last_visit,
    avg_ticket
  FROM stats
  LIMIT 1;
END;
$$;

-- Função para obter os serviços mais frequentes do cliente
CREATE OR REPLACE FUNCTION get_client_top_services(
  client_id UUID,
  limit_count INTEGER DEFAULT 5
)
RETURNS TABLE (
  service_name TEXT,
  count BIGINT,
  total_spent DECIMAL
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.name as service_name,
    COUNT(*) as count,
    SUM(ch.value) as total_spent
  FROM client_history ch
  JOIN services s ON s.id = ch.service_id
  WHERE ch.client_id = $1
  GROUP BY s.name
  ORDER BY count DESC
  LIMIT limit_count;
END;
$$;

-- Trigger para atualizar histórico do cliente após agendamento
CREATE OR REPLACE FUNCTION update_client_history()
RETURNS TRIGGER AS $$
BEGIN
  -- Insere o registro no histórico
  INSERT INTO client_history (
    client_id,
    appointment_id,
    service_id,
    professional_id,
    date,
    time,
    procedure,
    service_name,
    value,
    payment_method,
    payment_status,
    notes,
    created_at,
    updated_at
  )
  SELECT
    NEW.client_id,
    NEW.id,
    NEW.service_id,
    NEW.professional_id,
    DATE(NEW.start_time),
    TO_CHAR(NEW.start_time, 'HH24:MI'),
    s.name,
    s.name,
    s.price,
    COALESCE(NEW.payment_method, 'pending'),
    COALESCE(NEW.payment_status, 'pending'),
    NEW.notes,
    NOW(),
    NOW()
  FROM services s
  WHERE s.id = NEW.service_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar histórico quando o agendamento é atualizado
CREATE TRIGGER appointments_history_trigger
AFTER INSERT OR UPDATE ON appointments
FOR EACH ROW
EXECUTE FUNCTION update_client_history();
