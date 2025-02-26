import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Variáveis de ambiente do Supabase não encontradas')
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function updateTables() {
  try {
    console.log('Iniciando atualização das tabelas...')

    // Atualiza business_settings
    console.log('Atualizando business_settings...')
    const { error: businessError } = await supabase.rpc('execute_sql', {
      sql_query: `
        ALTER TABLE business_settings
        ADD COLUMN IF NOT EXISTS calendly_token text,
        ADD COLUMN IF NOT EXISTS clickhouse_endpoint text,
        ADD COLUMN IF NOT EXISTS firebase_config jsonb,
        ADD COLUMN IF NOT EXISTS redis_url text,
        ADD COLUMN IF NOT EXISTS logflare_api_key text;
      `
    })
    if (businessError) throw businessError

    // Atualiza professionals
    console.log('Atualizando professionals...')
    const { error: professionalsError } = await supabase.rpc('execute_sql', {
      sql_query: `
        ALTER TABLE professionals
        ADD COLUMN IF NOT EXISTS calendly_link text,
        ADD COLUMN IF NOT EXISTS firebase_uid text,
        ADD COLUMN IF NOT EXISTS disponibilidade jsonb;
      `
    })
    if (professionalsError) throw professionalsError

    // Atualiza clients
    console.log('Atualizando clients...')
    const { error: clientsError } = await supabase.rpc('execute_sql', {
      sql_query: `
        ALTER TABLE clients
        ADD COLUMN IF NOT EXISTS data_nascimento date,
        ADD COLUMN IF NOT EXISTS preferencias text[],
        ADD COLUMN IF NOT EXISTS notas text,
        ADD COLUMN IF NOT EXISTS firebase_uid text;
      `
    })
    if (clientsError) throw clientsError

    // Atualiza appointments
    console.log('Atualizando appointments...')
    const { error: appointmentsError } = await supabase.rpc('execute_sql', {
      sql_query: `
        ALTER TABLE appointments
        ADD COLUMN IF NOT EXISTS calendly_event_id text,
        ADD COLUMN IF NOT EXISTS google_event_id text,
        ADD COLUMN IF NOT EXISTS confirmacao_enviada boolean DEFAULT false,
        ADD COLUMN IF NOT EXISTS lembrete_enviado boolean DEFAULT false;
      `
    })
    if (appointmentsError) throw appointmentsError

    // Cria tabela metrics_history
    console.log('Criando tabela metrics_history...')
    const { error: metricsError } = await supabase.rpc('execute_sql', {
      sql_query: `
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
      `
    })
    if (metricsError) throw metricsError

    // Cria tabela integration_logs
    console.log('Criando tabela integration_logs...')
    const { error: logsError } = await supabase.rpc('execute_sql', {
      sql_query: `
        CREATE TABLE IF NOT EXISTS integration_logs (
          id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
          integration text NOT NULL,
          event text NOT NULL,
          status text NOT NULL,
          details jsonb,
          created_at timestamp with time zone DEFAULT now()
        );
      `
    })
    if (logsError) throw logsError

    // Cria índices
    console.log('Criando índices...')
    const { error: indexError } = await supabase.rpc('execute_sql', {
      sql_query: `
        CREATE INDEX IF NOT EXISTS idx_appointments_calendly_event_id ON appointments(calendly_event_id);
        CREATE INDEX IF NOT EXISTS idx_appointments_google_event_id ON appointments(google_event_id);
        CREATE INDEX IF NOT EXISTS idx_metrics_history_date ON metrics_history(date);
        CREATE INDEX IF NOT EXISTS idx_integration_logs_created_at ON integration_logs(created_at);
      `
    })
    if (indexError) throw indexError

    // Cria função de log
    console.log('Criando função de log...')
    const { error: functionError } = await supabase.rpc('execute_sql', {
      sql_query: `
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
      `
    })
    if (functionError) throw functionError

    console.log('Todas as atualizações foram concluídas com sucesso!')

  } catch (error) {
    console.error('Erro ao atualizar tabelas:', error)
  }
}

updateTables()
