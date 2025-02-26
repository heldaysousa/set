export interface User {
  id: string
  email: string
  business_id: string
  created_at: string
  updated_at: string
  name: string
  role: 'owner' | 'admin' | 'professional'
}

export interface Business {
  id: string
  name: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  zip_code: string
  working_days: string[]
  start_time: string
  end_time: string
  scheduling_interval: number
  created_at: string
  updated_at: string
}

export interface Client {
  id: string
  business_id: string
  name: string
  email: string
  phone: string
  created_at: string
  updated_at: string
  status: 'active' | 'inactive'
  last_visit: string | null
  notes: string | null
}

export interface Professional {
  id: string
  business_id: string
  name: string
  email: string
  phone: string
  role: string
  specialties: string[]
  commission_rate: number
  working_days: string[]
  start_time: string
  end_time: string
  status: 'active' | 'inactive'
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
  category: string
  main_professional_id?: string
  secondary_professional_id?: string
  is_maintenance: boolean
  is_application: boolean
  status: 'active' | 'inactive'
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
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled'
  notes: string | null
  created_at: string
  updated_at: string
}

export interface AgendamentoCompleto extends Appointment {
  client: Client
  professional: Professional
  service: Service
}

export interface Transacao {
  id: string
  business_id: string
  tipo: 'entrada' | 'saida'
  valor: number
  data: string
  data_vencimento?: string
  categoria: string
  descricao: string
  forma_pagamento?: string
  recorrente: boolean
  comprovante_url?: string
  status: 'pendente' | 'concluido'
}

export interface Categoria {
  id: string
  business_id: string
  nome: string
  tipo: 'entrada' | 'saida'
  cor: string
  icone: string
}

export interface ComissaoPagamento {
  id: string
  business_id: string
  professional_id: string
  valor: number
  data_fechamento: string
  data_pagamento: string
  status: 'pendente' | 'pago'
  appointments: string[] // IDs dos agendamentos
  created_at: string
}

export interface MetaFinanceira {
  id: string
  business_id: string
  tipo: 'receita' | 'despesa' | 'economia'
  valor: number
  periodo: 'diario' | 'mensal' | 'anual'
  data_inicio: string
  data_fim?: string
  descricao?: string
}
