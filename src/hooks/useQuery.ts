import { useQuery } from '@tanstack/react-query'
import { useApi } from './useApi'
import type { 
  Client, 
  Professional, 
  Service, 
  Appointment,
  MetaFinanceira 
} from '@/lib/types/supabase'

// Clientes
export function useClients() {
  const api = useApi()
  return useQuery<Client[]>({
    queryKey: ['clients'],
    queryFn: () => api.getClients()
  })
}

export function useClient(clientId: string) {
  const api = useApi()
  return useQuery<Client>({
    queryKey: ['clients', clientId],
    queryFn: () => api.getClient(clientId),
    enabled: !!clientId
  })
}

// Profissionais
export function useProfessionals() {
  const api = useApi()
  return useQuery<Professional[]>({
    queryKey: ['professionals'],
    queryFn: () => api.getProfessionals()
  })
}

export function useProfessional(professionalId: string) {
  const api = useApi()
  return useQuery<Professional>({
    queryKey: ['professionals', professionalId],
    queryFn: () => api.getProfessional(professionalId),
    enabled: !!professionalId
  })
}

// Serviços
export function useServices() {
  const api = useApi()
  return useQuery<Service[]>({
    queryKey: ['services'],
    queryFn: () => api.getServices()
  })
}

export function useService(serviceId: string) {
  const api = useApi()
  return useQuery<Service>({
    queryKey: ['services', serviceId],
    queryFn: () => api.getService(serviceId),
    enabled: !!serviceId
  })
}

// Agendamentos
export function useAppointments(filters?: {
  startDate?: string
  endDate?: string
  clientId?: string
  professionalId?: string
  status?: string
}) {
  const api = useApi()
  return useQuery<Appointment[]>({
    queryKey: ['appointments', filters],
    queryFn: () => api.getAppointments(filters)
  })
}

export function useAppointment(appointmentId: string) {
  const api = useApi()
  return useQuery<Appointment>({
    queryKey: ['appointments', appointmentId],
    queryFn: () => api.getAppointment(appointmentId),
    enabled: !!appointmentId
  })
}

// Metas Financeiras
export function useFinancialGoals() {
  const api = useApi()
  return useQuery<MetaFinanceira[]>({
    queryKey: ['financial-goals'],
    queryFn: () => api.getFinancialGoals()
  })
}

export function useFinancialGoal(goalId: string) {
  const api = useApi()
  return useQuery<MetaFinanceira>({
    queryKey: ['financial-goals', goalId],
    queryFn: () => api.getFinancialGoal(goalId),
    enabled: !!goalId
  })
}
