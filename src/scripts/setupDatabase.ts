import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_KEY // Usando a service_role key para ter permissões completas

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Variáveis de ambiente do Supabase não encontradas')
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function setupDatabase() {
  try {
    console.log('Iniciando configuração do banco de dados...')

    // 1. Lê e executa os scripts SQL
    const scriptsPath = path.join(__dirname)
    const scriptFiles = [
      'setupExtensions.sql',
      'updateSchema.sql',
      'setupFunctions.sql',
      'setupRPC.sql'
    ]

    for (const scriptFile of scriptFiles) {
      console.log(`\nExecutando ${scriptFile}...`)
      const sqlContent = fs.readFileSync(path.join(scriptsPath, scriptFile), 'utf8')
      
      // Divide o script em comandos individuais
      const commands = sqlContent
        .split(';')
        .map(cmd => cmd.trim())
        .filter(cmd => cmd.length > 0)

      // Executa cada comando separadamente
      for (const command of commands) {
        try {
          const { error } = await supabase.rpc('exec_sql', {
            sql_query: command
          })

          if (error) {
            console.warn(`Aviso ao executar comando: ${error.message}`)
            console.warn('Comando:', command)
          }
        } catch (error) {
          console.warn('Erro ao executar comando:', error)
          console.warn('Comando:', command)
          // Continua com o próximo comando
        }
      }
    }

    // 2. Verifica se as extensões foram instaladas
    console.log('\nVerificando extensões...')
    try {
      const { data: extensions, error: extError } = await supabase.rpc('list_extensions')
      if (extError) {
        console.error('Erro ao listar extensões:', extError)
      } else {
        console.log('Extensões instaladas:', extensions)
      }
    } catch (error) {
      console.warn('Erro ao verificar extensões:', error)
    }

    // 3. Verifica se as tabelas foram criadas
    console.log('\nVerificando tabelas...')
    try {
      const { data: tables, error: tablesError } = await supabase.rpc('list_tables')
      if (tablesError) {
        console.error('Erro ao listar tabelas:', tablesError)
      } else {
        console.log('Tabelas criadas:', tables)
      }
    } catch (error) {
      console.warn('Erro ao verificar tabelas:', error)
    }

    // 4. Configura políticas de segurança
    console.log('\nConfigurando políticas de segurança...')
    const policies = [
      {
        table: 'business_settings',
        name: 'business_settings_select',
        definition: 'auth.uid() IN (SELECT user_id FROM business_users WHERE business_id = id)'
      },
      {
        table: 'professionals',
        name: 'professionals_select',
        definition: 'auth.uid() IN (SELECT user_id FROM business_users WHERE business_id = business_id)'
      },
      {
        table: 'clients',
        name: 'clients_select',
        definition: 'auth.uid() IN (SELECT user_id FROM business_users WHERE business_id = business_id)'
      }
    ]

    for (const policy of policies) {
      try {
        const { error: policyError } = await supabase.rpc('create_policy', {
          table_name: policy.table,
          policy_name: policy.name,
          policy_definition: policy.definition
        })

        if (policyError) {
          console.warn(`Aviso ao criar política ${policy.name}:`, policyError)
        }
      } catch (error) {
        console.warn(`Erro ao criar política ${policy.name}:`, error)
      }
    }

    // 5. Configura buckets para armazenamento
    console.log('\nConfigurando storage buckets...')
    const buckets = ['avatars', 'products', 'documents']
    
    for (const bucket of buckets) {
      try {
        const { error: bucketError } = await supabase.storage.createBucket(bucket, {
          public: false,
          allowedMimeTypes: ['image/*', 'application/pdf'],
          fileSizeLimit: 5242880 // 5MB
        })

        if (bucketError) {
          console.warn(`Aviso ao criar bucket ${bucket}:`, bucketError)
        }
      } catch (error) {
        console.warn(`Erro ao criar bucket ${bucket}:`, error)
      }
    }

    // 6. Configura funções Edge
    console.log('\nConfigurando funções Edge...')
    const edgeFunctions = [
      {
        name: 'process-webhook',
        method: 'POST',
        path: '/webhook'
      },
      {
        name: 'send-notification',
        method: 'POST',
        path: '/notify'
      }
    ]

    for (const func of edgeFunctions) {
      try {
        const { error: funcError } = await supabase.functions.create(func.name, {
          verify_jwt: true
        })

        if (funcError) {
          console.warn(`Aviso ao criar função ${func.name}:`, funcError)
        }
      } catch (error) {
        console.warn(`Erro ao criar função ${func.name}:`, error)
      }
    }

    console.log('\nConfiguração do banco de dados concluída!')

  } catch (error) {
    console.error('Erro durante a configuração:', error)
    process.exit(1)
  }
}

setupDatabase()
