-- Extensões para Performance
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
CREATE EXTENSION IF NOT EXISTS "pg_stat_monitor";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";
CREATE EXTENSION IF NOT EXISTS "btree_gist";

-- Extensões para Segurança
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pgsodium";
CREATE EXTENSION IF NOT EXISTS "pgaudit";

-- Extensões para Funcionalidades
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_cron";
CREATE EXTENSION IF NOT EXISTS "http";
CREATE EXTENSION IF NOT EXISTS "pg_net";

-- Extensões para Busca e Cache
CREATE EXTENSION IF NOT EXISTS "unaccent";
CREATE EXTENSION IF NOT EXISTS "fuzzystrmatch";

-- Configurações de Performance
ALTER SYSTEM SET pg_stat_statements.max = 10000;
ALTER SYSTEM SET pg_stat_statements.track = 'all';
ALTER SYSTEM SET pg_stat_monitor.pgsm_query_max_len = 2048;

-- Configurações de Auditoria
ALTER SYSTEM SET pgaudit.log = 'write';
ALTER SYSTEM SET pgaudit.log_catalog = 'off';
ALTER SYSTEM SET pgaudit.log_relation = 'on';

-- Permissões
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres, service_role;

-- Índices úteis para buscas com unaccent e fuzzystrmatch
CREATE INDEX IF NOT EXISTS idx_clients_nome_unaccent 
ON clients (unaccent(nome) text_pattern_ops);

CREATE INDEX IF NOT EXISTS idx_professionals_nome_unaccent 
ON professionals (unaccent(nome) text_pattern_ops);

CREATE INDEX IF NOT EXISTS idx_services_nome_unaccent 
ON services (unaccent(nome) text_pattern_ops);

-- Função auxiliar para busca fuzzy de clientes
CREATE OR REPLACE FUNCTION search_clients_fuzzy(search_term text)
RETURNS TABLE (
    id uuid,
    nome text,
    similarity float
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id,
        c.nome,
        similarity(unaccent(lower(c.nome)), unaccent(lower(search_term))) as similarity
    FROM clients c
    WHERE 
        similarity(unaccent(lower(c.nome)), unaccent(lower(search_term))) > 0.3
    ORDER BY similarity DESC;
END;
$$ LANGUAGE plpgsql;
