export interface Client {
  id: string
  name: string
  email: string
  phone: string
  birthDate: string
  instagram?: string
  facebook?: string
  whatsapp?: string
  notes?: string
  createdAt: string
  updatedAt: string
  businessId: string
}

export interface ClientHistory {
  id: string
  clientId: string
  serviceId: string
  professionalId: string
  date: string
  time: string
  duration: number
  value: number
  serviceName: string
  professionalName: string
  serviceDetails?: string
  status: 'concluido' | 'cancelado' | 'agendado'
  paymentMethod?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface ClientWithHistory extends Client {
  history: ClientHistory[]
  totalSpent: number
  lastVisit?: string
  visitCount: number
}
