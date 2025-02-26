export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          role: 'admin' | 'user'
          active: boolean
          business_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['users']['Row']>
      }
      businesses: {
        Row: {
          id: string
          name: string
          owner_id: string
          type: string
          phone: string
          employees: string
          goals: string
          challenges: string
          settings: Record<string, any>
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['businesses']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['businesses']['Row']>
      }
      services: {
        Row: {
          id: string
          business_id: string
          name: string
          description: string
          duration: number
          price: number
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['services']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['services']['Row']>
      }
      professionals: {
        Row: {
          id: string
          business_id: string
          name: string
          email: string
          phone: string
          specialties: string[]
          commission_rate: number
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['professionals']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['professionals']['Row']>
      }
      clients: {
        Row: {
          id: string
          business_id: string
          name: string
          email: string
          phone: string
          birth_date: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['clients']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['clients']['Row']>
      }
      appointments: {
        Row: {
          id: string
          business_id: string
          client_id: string
          professional_id: string
          service_id: string
          date: string
          status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled'
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['appointments']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['appointments']['Row']>
      }
      business_settings: {
        Row: {
          id: string
          business_id: string
          working_hours: {
            start: string
            end: string
            days: number[]
          }
          notification_preferences: {
            email: boolean
            sms: boolean
            whatsapp: boolean
          }
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['business_settings']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['business_settings']['Row']>
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

export interface Business {
  id: string
  name: string
  owner_id: string
  type: string
  phone: string
  email: string
  address: string
  city: string
  state: string
  zip: string
  logo_url: string | null
  settings: Json
  schedule_start: string
  schedule_end: string
  working_days: string[]
  schedule_interval: number
  created_at: string
  updated_at: string
}

export interface User {
  id: string
  email: string
  name: string
  avatar_url: string | null
  business_id: string
  role: 'admin' | 'user'
  active: boolean
  created_at: string
  updated_at: string
}

export interface Professional {
  id: string
  business_id: string
  name: string
  email: string
  phone: string | null
  avatar_url: string | null
  bio: string | null
  specialties: string[]
  schedule: Json
  commission_rate: number
  active: boolean
  created_at: string
  updated_at: string
}

export interface Service {
  id: string
  business_id: string
  name: string
  description: string | null
  price: number
  duration: number
  image_url: string | null
  category: string
  created_at: string
  updated_at: string
}

export interface Client {
  id: string
  business_id: string
  name: string
  email: string
  phone: string
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface Appointment {
  id: string
  business_id: string
  client_id: string
  professional_id: string
  service_id: string
  start_time: string
  end_time: string
  status: string
  notes: string | null
  created_at: string
  updated_at: string
  professional?: Professional
  service?: Service
  client?: Client
}

export interface AgendamentoCompleto extends Appointment {
  professional: Professional
  service: Service
  client: Client
}

export interface MetaFinanceira {
  id: string
  business_id: string
  tipo: string
  valor: number
  periodo: string
  data_inicio: string
  data_fim: string
  descricao?: string
  created_at: string
  updated_at: string
}

export interface WorkingHours {
  start: string
  end: string
  break_start?: string
  break_end?: string
}

export interface Schedule {
  [key: number]: WorkingHours
}
