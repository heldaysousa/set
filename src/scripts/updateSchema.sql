-- Atualiza a tabela business_settings
ALTER TABLE business_settings
ADD COLUMN IF NOT EXISTS calendly_token text,
ADD COLUMN IF NOT EXISTS clickhouse_endpoint text,
ADD COLUMN IF NOT EXISTS firebase_config jsonb,
ADD COLUMN IF NOT EXISTS redis_url text,
ADD COLUMN IF NOT EXISTS logflare_api_key text,
ADD COLUMN IF NOT EXISTS business_type text,
ADD COLUMN IF NOT EXISTS logo_url text,
ADD COLUMN IF NOT EXISTS theme jsonb,
ADD COLUMN IF NOT EXISTS notification_settings jsonb,
ADD COLUMN IF NOT EXISTS integration_settings jsonb,
ADD COLUMN IF NOT EXISTS payment_settings jsonb,
ADD COLUMN IF NOT EXISTS business_hours jsonb,
ADD COLUMN IF NOT EXISTS tax_settings jsonb;

-- Atualiza a tabela professionals
ALTER TABLE professionals
ADD COLUMN IF NOT EXISTS calendly_link text,
ADD COLUMN IF NOT EXISTS firebase_uid text,
ADD COLUMN IF NOT EXISTS disponibilidade jsonb,
ADD COLUMN IF NOT EXISTS profile_image text,
ADD COLUMN IF NOT EXISTS services text[],
ADD COLUMN IF NOT EXISTS schedule jsonb,
ADD COLUMN IF NOT EXISTS commission_rate numeric(5,2),
ADD COLUMN IF NOT EXISTS rating numeric(3,2),
ADD COLUMN IF NOT EXISTS total_reviews integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS skills text[],
ADD COLUMN IF NOT EXISTS certificates text[];

-- Atualiza a tabela clients
ALTER TABLE clients
ADD COLUMN IF NOT EXISTS data_nascimento date,
ADD COLUMN IF NOT EXISTS preferencias text[],
ADD COLUMN IF NOT EXISTS notas text,
ADD COLUMN IF NOT EXISTS firebase_uid text,
ADD COLUMN IF NOT EXISTS profile_image text,
ADD COLUMN IF NOT EXISTS address jsonb,
ADD COLUMN IF NOT EXISTS favorite_services text[],
ADD COLUMN IF NOT EXISTS last_visit timestamp with time zone,
ADD COLUMN IF NOT EXISTS total_visits integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS lifetime_value numeric(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS referral_source text,
ADD COLUMN IF NOT EXISTS marketing_preferences jsonb;

-- Atualiza a tabela appointments
ALTER TABLE appointments
ADD COLUMN IF NOT EXISTS calendly_event_id text,
ADD COLUMN IF NOT EXISTS google_event_id text,
ADD COLUMN IF NOT EXISTS confirmacao_enviada boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS lembrete_enviado boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS payment_status text,
ADD COLUMN IF NOT EXISTS payment_method text,
ADD COLUMN IF NOT EXISTS discount_amount numeric(10,2),
ADD COLUMN IF NOT EXISTS tax_amount numeric(10,2),
ADD COLUMN IF NOT EXISTS total_amount numeric(10,2),
ADD COLUMN IF NOT EXISTS notes text,
ADD COLUMN IF NOT EXISTS rating integer,
ADD COLUMN IF NOT EXISTS review text,
ADD COLUMN IF NOT EXISTS review_date timestamp with time zone;

-- Cria tabela de métricas
CREATE TABLE IF NOT EXISTS metrics_history (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    date timestamp with time zone NOT NULL,
    total_appointments integer NOT NULL,
    total_revenue numeric(10,2) NOT NULL,
    average_ticket numeric(10,2) NOT NULL,
    conversion_rate numeric(5,2) NOT NULL,
    customer_satisfaction numeric(3,1),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Cria tabela de logs
CREATE TABLE IF NOT EXISTS integration_logs (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    integration text NOT NULL,
    event text NOT NULL,
    status text NOT NULL,
    details jsonb,
    created_at timestamp with time zone DEFAULT now()
);

-- Cria índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_appointments_calendly_event_id ON appointments(calendly_event_id);
CREATE INDEX IF NOT EXISTS idx_appointments_google_event_id ON appointments(google_event_id);
CREATE INDEX IF NOT EXISTS idx_metrics_history_date ON metrics_history(date);
CREATE INDEX IF NOT EXISTS idx_integration_logs_created_at ON integration_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(data);
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);
CREATE INDEX IF NOT EXISTS idx_professionals_services ON professionals USING gin(services);
CREATE INDEX IF NOT EXISTS idx_services_category ON services(categoria);
CREATE INDEX IF NOT EXISTS idx_product_sales_date ON product_sales(sale_date);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);
CREATE INDEX IF NOT EXISTS idx_commissions_status ON commissions(status);

-- Cria função para registrar logs de integração
CREATE OR REPLACE FUNCTION log_integration_event(
    p_integration text,
    p_event text,
    p_status text,
    p_details jsonb DEFAULT NULL
) RETURNS uuid AS $$
DECLARE
    v_log_id uuid;
BEGIN
    INSERT INTO integration_logs (integration, event, status, details)
    VALUES (p_integration, p_event, p_status, p_details)
    RETURNING id INTO v_log_id;
    
    RETURN v_log_id;
END;
$$ LANGUAGE plpgsql;

-- Cria tabela de produtos
CREATE TABLE IF NOT EXISTS products (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    business_id uuid REFERENCES business_settings(id),
    name text NOT NULL,
    description text,
    price numeric(10,2) NOT NULL,
    cost numeric(10,2),
    stock integer DEFAULT 0,
    minimum_stock integer DEFAULT 5,
    brand text,
    supplier text,
    category text,
    image_url text,
    barcode text,
    status text DEFAULT 'active',
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Cria tabela de vendas de produtos
CREATE TABLE IF NOT EXISTS product_sales (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    business_id uuid REFERENCES business_settings(id),
    product_id uuid REFERENCES products(id),
    client_id uuid REFERENCES clients(id),
    quantity integer NOT NULL,
    unit_price numeric(10,2) NOT NULL,
    total_amount numeric(10,2) NOT NULL,
    payment_method text,
    payment_status text,
    sale_date timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Cria tabela de comissões
CREATE TABLE IF NOT EXISTS commissions (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    business_id uuid REFERENCES business_settings(id),
    professional_id uuid REFERENCES professionals(id),
    appointment_id uuid REFERENCES appointments(id),
    service_id uuid REFERENCES services(id),
    amount numeric(10,2) NOT NULL,
    percentage numeric(5,2) NOT NULL,
    status text DEFAULT 'pending',
    payment_date timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Cria tabela de despesas
CREATE TABLE IF NOT EXISTS expenses (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    business_id uuid REFERENCES business_settings(id),
    category text NOT NULL,
    description text,
    amount numeric(10,2) NOT NULL,
    date timestamp with time zone NOT NULL,
    payment_method text,
    status text DEFAULT 'pending',
    recurring boolean DEFAULT false,
    recurrence_interval text,
    next_due_date timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Cria tabela de metas
CREATE TABLE IF NOT EXISTS goals (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    business_id uuid REFERENCES business_settings(id),
    type text NOT NULL,
    target numeric(10,2) NOT NULL,
    current numeric(10,2) DEFAULT 0,
    start_date timestamp with time zone NOT NULL,
    end_date timestamp with time zone NOT NULL,
    status text DEFAULT 'active',
    notes text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Cria views para relatórios comuns
CREATE OR REPLACE VIEW daily_revenue AS
SELECT 
    date_trunc('day', a.data) as day,
    COUNT(a.id) as total_appointments,
    SUM(a.total_amount) as total_revenue,
    AVG(a.total_amount) as average_ticket
FROM appointments a
WHERE a.status = 'completed'
GROUP BY date_trunc('day', a.data)
ORDER BY day DESC;

CREATE OR REPLACE VIEW professional_performance AS
SELECT 
    p.id,
    p.nome,
    COUNT(a.id) as total_appointments,
    SUM(a.total_amount) as total_revenue,
    AVG(a.rating) as average_rating,
    COUNT(DISTINCT c.id) as unique_clients
FROM professionals p
LEFT JOIN appointments a ON a.professional_id = p.id
LEFT JOIN clients c ON a.client_id = c.id
WHERE a.status = 'completed'
GROUP BY p.id, p.nome;
