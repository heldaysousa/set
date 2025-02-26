-- Configuração das integrações
-- GraphQL
CREATE EXTENSION IF NOT EXISTS "pg_graphql";
GRANT USAGE ON SCHEMA graphql TO postgres, anon, authenticated, service_role;

-- Cofre (Vault)
CREATE EXTENSION IF NOT EXISTS "pgsodium";
CREATE EXTENSION IF NOT EXISTS "vault";

-- Webhooks
CREATE EXTENSION IF NOT EXISTS "pg_net";
CREATE EXTENSION IF NOT EXISTS "http";

-- Cron
CREATE EXTENSION IF NOT EXISTS "pg_cron";

-- Logflare
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
CREATE EXTENSION IF NOT EXISTS "pg_stat_monitor";

-- Redis Cache
CREATE EXTENSION IF NOT EXISTS "redis_fdw";

-- BigQuery
CREATE EXTENSION IF NOT EXISTS "postgres_fdw";

-- Configuração de Políticas de Segurança
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres, service_role;

-- Configuração de Funções RPC
CREATE OR REPLACE FUNCTION get_dashboard_metrics(
    business_id uuid,
    start_date timestamp,
    end_date timestamp
) RETURNS json AS $$
DECLARE
    result json;
BEGIN
    WITH metrics AS (
        SELECT
            COUNT(DISTINCT a.id) as total_appointments,
            COUNT(DISTINCT c.id) as total_clients,
            SUM(CASE WHEN t.status = 'confirmado' THEN t.valor ELSE 0 END) as total_revenue,
            COUNT(DISTINCT p.id) as total_professionals,
            AVG(CASE WHEN t.status = 'confirmado' THEN t.valor ELSE 0 END) as avg_ticket
        FROM appointments a
        LEFT JOIN clients c ON c.id = a.client_id
        LEFT JOIN professionals p ON p.id = a.professional_id
        LEFT JOIN transactions t ON t.appointment_id = a.id
        WHERE 
            a.business_id = business_id
            AND a.data BETWEEN start_date AND end_date
    )
    SELECT json_build_object(
        'appointments', total_appointments,
        'clients', total_clients,
        'revenue', total_revenue,
        'professionals', total_professionals,
        'average_ticket', avg_ticket
    ) INTO result
    FROM metrics;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Configuração de Triggers para Webhooks
CREATE OR REPLACE FUNCTION notify_appointment_webhook()
RETURNS trigger AS $$
BEGIN
    PERFORM net.http_post(
        'https://api.calendly.com/webhook',
        jsonb_build_object(
            'event', TG_OP,
            'appointment', row_to_json(NEW)
        )::text,
        'application/json'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER appointment_webhook_trigger
    AFTER INSERT OR UPDATE
    ON appointments
    FOR EACH ROW
    EXECUTE FUNCTION notify_appointment_webhook();

-- Configuração de Jobs Cron
SELECT cron.schedule(
    'daily-metrics',
    '0 0 * * *',
    $$
    INSERT INTO metrics_history (
        date,
        total_appointments,
        total_revenue,
        total_clients
    )
    SELECT
        CURRENT_DATE,
        COUNT(DISTINCT a.id),
        SUM(CASE WHEN t.status = 'confirmado' THEN t.valor ELSE 0 END),
        COUNT(DISTINCT c.id)
    FROM appointments a
    LEFT JOIN clients c ON c.id = a.client_id
    LEFT JOIN transactions t ON t.appointment_id = a.id
    WHERE a.data::date = CURRENT_DATE;
    $$
);

-- Configuração de Cache Redis
CREATE SERVER redis_server
    FOREIGN DATA WRAPPER redis_fdw
    OPTIONS (address 'redis', port '6379');

CREATE USER MAPPING FOR postgres
    SERVER redis_server
    OPTIONS (password 'redis_password');

CREATE FOREIGN TABLE redis_cache (
    key text,
    value text
)
SERVER redis_server
OPTIONS (database '0');

-- Função para cache de métricas
CREATE OR REPLACE FUNCTION get_cached_metrics(
    business_id uuid,
    cache_key text
) RETURNS json AS $$
DECLARE
    cached_value text;
    result json;
BEGIN
    -- Tenta buscar do cache
    SELECT value INTO cached_value
    FROM redis_cache
    WHERE key = cache_key;
    
    IF cached_value IS NOT NULL THEN
        RETURN cached_value::json;
    END IF;
    
    -- Se não estiver em cache, calcula e armazena
    SELECT get_dashboard_metrics(
        business_id,
        CURRENT_DATE - interval '30 days',
        CURRENT_DATE
    ) INTO result;
    
    -- Armazena no cache
    INSERT INTO redis_cache (key, value)
    VALUES (cache_key, result::text)
    ON CONFLICT (key) DO UPDATE
    SET value = EXCLUDED.value;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;
