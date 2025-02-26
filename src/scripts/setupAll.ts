import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as fs from 'fs'
import * as path from 'path'

dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Variáveis de ambiente do Supabase não encontradas')
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function setupAll() {
  try {
    console.log('Iniciando configuração completa do sistema...')

    // 1. Habilita extensões
    console.log('\n1. Habilitando extensões...')
    const extensionsScript = fs.readFileSync(
      path.join(__dirname, 'setupExtensions.ts'),
      'utf8'
    )
    await require('./setupExtensions')

    // 2. Configura funções SQL
    console.log('\n2. Configurando funções SQL...')
    const sqlScript = fs.readFileSync(
      path.join(__dirname, 'setupFunctions.sql'),
      'utf8'
    )
    const { error: sqlError } = await supabase.rpc('execute_sql_script', {
      script: sqlScript
    })
    if (sqlError) throw sqlError

    // 3. Configura tabelas e índices
    console.log('\n3. Configurando tabelas e índices...')
    const schemaScript = fs.readFileSync(
      path.join(__dirname, 'updateSchema.sql'),
      'utf8'
    )
    const { error: schemaError } = await supabase.rpc('execute_sql_script', {
      script: schemaScript
    })
    if (schemaError) throw schemaError

    // 4. Configura integrações
    console.log('\n4. Configurando integrações...')
    const integrations = {
      calendly: {
        token: process.env.CALENDLY_TOKEN,
        webhook_url: `${supabaseUrl}/rest/v1/rpc/handle_calendly_webhook`
      },
      firebase: {
        config: {
          apiKey: process.env.FIREBASE_API_KEY,
          projectId: process.env.FIREBASE_PROJECT_ID,
          messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID
        }
      },
      redis: {
        url: process.env.REDIS_URL || 'redis://localhost:6379'
      },
      clickhouse: {
        endpoint: process.env.CLICKHOUSE_ENDPOINT
      },
      logflare: {
        api_key: process.env.LOGFLARE_API_KEY
      }
    }

    const { error: integrationError } = await supabase
      .from('business_settings')
      .upsert({
        calendly_token: integrations.calendly.token,
        firebase_config: integrations.firebase.config,
        redis_url: integrations.redis.url,
        clickhouse_endpoint: integrations.clickhouse.endpoint,
        logflare_api_key: integrations.logflare.api_key,
        updated_at: new Date().toISOString()
      })
      .eq('id', process.env.BUSINESS_ID)

    if (integrationError) throw integrationError

    // 5. Configura jobs cron
    console.log('\n5. Configurando jobs cron...')
    const jobs = [
      {
        name: 'daily_metrics',
        schedule: '0 0 * * *', // Todo dia à meia-noite
        command: 'SELECT calculate_daily_metrics();'
      },
      {
        name: 'appointment_reminders',
        schedule: '0 */1 * * *', // A cada hora
        command: 'SELECT send_appointment_reminders();'
      },
      {
        name: 'cache_cleanup',
        schedule: '0 1 * * *', // Todo dia à 1h da manhã
        command: 'SELECT cleanup_old_cache();'
      }
    ]

    for (const job of jobs) {
      const { error: jobError } = await supabase.rpc('schedule_cron_job', job)
      if (jobError) {
        console.warn(`Aviso ao configurar job ${job.name}:`, jobError.message)
      }
    }

    console.log('\nConfiguração completa realizada com sucesso!')
    console.log('\nRecursos habilitados:')
    console.log('✓ Extensões PostgreSQL')
    console.log('✓ Funções e Triggers')
    console.log('✓ Tabelas e Índices')
    console.log('✓ Integrações Externas')
    console.log('✓ Jobs Agendados')

  } catch (error) {
    console.error('Erro durante a configuração:', error)
    process.exit(1)
  }
}

setupAll()
