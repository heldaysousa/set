export interface User {
  id: string
  email: string
  businessId?: string
  created_at: string
  updated_at: string
}

export interface Business {
  id: string
  user_id: string
  nome: string
  cnpj: string
  telefone: string
  email: string
  endereco: string
  business_type: string
  business_hours: {
    monday: { start: string; end: string }
    tuesday: { start: string; end: string }
    wednesday: { start: string; end: string }
    thursday: { start: string; end: string }
    friday: { start: string; end: string }
    saturday: { start: string; end: string }
    sunday: { start: string; end: string }
  }
  challenges: string[]
  num_employees: string
  target_audience: string
  main_services: string[]
  avg_monthly_revenue: string
  management_tools?: string[]
  has_completed_setup: boolean
  status: 'active' | 'inactive'
  created_at: string
  updated_at: string
}

export interface BusinessSettings {
  theme: {
    mode: 'light' | 'dark' | 'system'
    primaryColor: string
    fontSize: 'small' | 'medium' | 'large'
    animations: boolean
  }
  notifications: {
    email: boolean
    push: boolean
    sms: boolean
  }
  scheduling: {
    allowClientScheduling: boolean
    requirePayment: boolean
    reminderTime: number
  }
}

export interface Client {
  id: string
  business_id: string
  name: string
  email: string
  phone?: string
  avatar_url?: string
  bio?: string
  status: 'active' | 'inactive'
  created_at: string
  updated_at: string
}

export interface ClientHistory {
  id: string
  client_id: string
  appointment_id: string
  service_id: string
  professional_id: string
  date: string
  time: string
  procedure: string
  service_name: string
  value: number
  payment_method: 'credit' | 'debit' | 'cash' | 'pix' | 'transfer'
  payment_status: 'paid' | 'pending' | 'cancelled'
  notes?: string
  created_at: string
  updated_at: string
}

export interface Professional {
  id: string
  business_id: string
  name: string
  email: string
  phone?: string
  avatar_url?: string
  bio?: string
  specialties: string[]
  schedule: Schedule
  created_at: string
  updated_at: string
}

export interface Service {
  id: string
  business_id: string
  name: string
  description?: string
  price: number
  duration: number
  image_url?: string
  category: string
  created_at: string
  updated_at: string
}

export interface Schedule {
  monday: DaySchedule
  tuesday: DaySchedule
  wednesday: DaySchedule
  thursday: DaySchedule
  friday: DaySchedule
  saturday: DaySchedule
  sunday: DaySchedule
}

export interface DaySchedule {
  enabled: boolean
  intervals: TimeInterval[]
}

export interface TimeInterval {
  start: string
  end: string
}

export interface Appointment {
  id: string
  business_id: string
  client_id: string
  professional_id: string
  service_id: string
  start_time: string
  end_time: string
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled'
  notes?: string
  created_at: string
  updated_at: string
}

export interface MetaFinanceira {
  id: string
  business_id: string
  tipo: 'receita' | 'despesa' | 'economia'
  valor: number
  periodo: 'diario' | 'semanal' | 'mensal' | 'anual'
  data_inicio: string
  data_fim: string
  created_at: string
  updated_at: string
}
