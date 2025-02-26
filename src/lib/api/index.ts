import { createClient } from '@supabase/supabase-js'
import { initializeApp } from 'firebase/app'
import { Database } from '@/types/supabase'

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  throw new Error('Variáveis de ambiente do Supabase não configuradas')
}

if (!import.meta.env.VITE_FIREBASE_CONFIG) {
  throw new Error('Variáveis de ambiente do Firebase não configuradas')
}

// Cliente Supabase tipado
export const supabase = createClient<Database>(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false
    }
  }
)

// Configuração do Firebase
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
}

export const firebase = initializeApp(firebaseConfig)

// Tipos exportados
export type { Tables } from '@/types/supabase'
export type { User, Service, Professional, Client, Appointment, BusinessSettings } from '@/types/supabase'
