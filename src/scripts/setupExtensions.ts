import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_KEY // Usando a service_role key para ter permissões de admin

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Variáveis de ambiente do Supabase não encontradas')
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function setupExtensions() {
  try {
    console.log('Iniciando configuração das extensões...')

    // Lista de extensões necessárias
    const extensions = [
      'pg_graphql',      // Para GraphQL
      'pgsodium',        // Para criptografia
      'pg_net',          // Para webhooks
      'http',            // Para requisições HTTP
      'pg_cron',         // Para agendamento de tarefas
      'pg_stat_statements', // Para monitoramento
      'pg_stat_monitor',    // Para métricas avançadas
      'redis_fdw',         // Para cache Redis
      'postgres_fdw',      // Para BigQuery
      'uuid-ossp'          // Para geração de UUIDs
    ]

    for (const ext of extensions) {
      console.log(`Habilitando extensão: ${ext}`)
      const { error } = await supabase.rpc('create_extension', {
        extension_name: ext
      })
      
      if (error) {
        console.warn(`Aviso ao habilitar ${ext}:`, error.message)
      } else {
        console.log(`✓ Extensão ${ext} habilitada com sucesso`)
      }
    }

    // Configurando permissões
    console.log('Configurando permissões...')
    await supabase.rpc('grant_permissions', {
      schema_name: 'public',
      role_name: 'authenticated'
    })

    console.log('Configuração das extensões concluída com sucesso!')

  } catch (error) {
    console.error('Erro ao configurar extensões:', error)
  }
}

setupExtensions()
