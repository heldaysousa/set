import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useApi } from './useApi'
import { toast } from 'sonner'
import type { 
  Client, 
  Professional, 
  Service, 
  Appointment,
  MetaFinanceira 
} from '@/lib/types/supabase'

// Clientes
export function useCreateClient() {
  const api = useApi()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: api.createClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      toast.success('Cliente criado com sucesso')
    },
    onError: (error: Error) => {
      toast.error('Erro ao criar cliente: ' + error.message)
    }
  })
}

export function useUpdateClient() {
  const api = useApi()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ clientId, data }: { clientId: string; data: Partial<Client> }) =>
      api.updateClient(clientId, data),
    onSuccess: (_, { clientId }) => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      queryClient.invalidateQueries({ queryKey: ['clients', clientId] })
      toast.success('Cliente atualizado com sucesso')
    },
    onError: (error: Error) => {
      toast.error('Erro ao atualizar cliente: ' + error.message)
    }
  })
}

export function useDeleteClient() {
  const api = useApi()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: api.deleteClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      toast.success('Cliente excluído com sucesso')
    },
    onError: (error: Error) => {
      toast.error('Erro ao excluir cliente: ' + error.message)
    }
  })
}

// Profissionais
export function useCreateProfessional() {
  const api = useApi()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: api.createProfessional,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['professionals'] })
      toast.success('Profissional criado com sucesso')
    },
    onError: (error: Error) => {
      toast.error('Erro ao criar profissional: ' + error.message)
    }
  })
}

export function useUpdateProfessional() {
  const api = useApi()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ professionalId, data }: { professionalId: string; data: Partial<Professional> }) =>
      api.updateProfessional(professionalId, data),
    onSuccess: (_, { professionalId }) => {
      queryClient.invalidateQueries({ queryKey: ['professionals'] })
      queryClient.invalidateQueries({ queryKey: ['professionals', professionalId] })
      toast.success('Profissional atualizado com sucesso')
    },
    onError: (error: Error) => {
      toast.error('Erro ao atualizar profissional: ' + error.message)
    }
  })
}

export function useDeleteProfessional() {
  const api = useApi()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: api.deleteProfessional,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['professionals'] })
      toast.success('Profissional excluído com sucesso')
    },
    onError: (error: Error) => {
      toast.error('Erro ao excluir profissional: ' + error.message)
    }
  })
}

// Serviços
export function useCreateService() {
  const api = useApi()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: api.createService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] })
      toast.success('Serviço criado com sucesso')
    },
    onError: (error: Error) => {
      toast.error('Erro ao criar serviço: ' + error.message)
    }
  })
}

export function useUpdateService() {
  const api = useApi()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ serviceId, data }: { serviceId: string; data: Partial<Service> }) =>
      api.updateService(serviceId, data),
    onSuccess: (_, { serviceId }) => {
      queryClient.invalidateQueries({ queryKey: ['services'] })
      queryClient.invalidateQueries({ queryKey: ['services', serviceId] })
      toast.success('Serviço atualizado com sucesso')
    },
    onError: (error: Error) => {
      toast.error('Erro ao atualizar serviço: ' + error.message)
    }
  })
}

export function useDeleteService() {
  const api = useApi()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: api.deleteService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] })
      toast.success('Serviço excluído com sucesso')
    },
    onError: (error: Error) => {
      toast.error('Erro ao excluir serviço: ' + error.message)
    }
  })
}

// Agendamentos
export function useCreateAppointment() {
  const api = useApi()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: api.createAppointment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] })
      toast.success('Agendamento criado com sucesso')
    },
    onError: (error: Error) => {
      toast.error('Erro ao criar agendamento: ' + error.message)
    }
  })
}

export function useUpdateAppointment() {
  const api = useApi()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ appointmentId, data }: { appointmentId: string; data: Partial<Appointment> }) =>
      api.updateAppointment(appointmentId, data),
    onSuccess: (_, { appointmentId }) => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] })
      queryClient.invalidateQueries({ queryKey: ['appointments', appointmentId] })
      toast.success('Agendamento atualizado com sucesso')
    },
    onError: (error: Error) => {
      toast.error('Erro ao atualizar agendamento: ' + error.message)
    }
  })
}

export function useDeleteAppointment() {
  const api = useApi()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: api.deleteAppointment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] })
      toast.success('Agendamento excluído com sucesso')
    },
    onError: (error: Error) => {
      toast.error('Erro ao excluir agendamento: ' + error.message)
    }
  })
}

// Metas Financeiras
export function useCreateFinancialGoal() {
  const api = useApi()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: api.createFinancialGoal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial-goals'] })
      toast.success('Meta financeira criada com sucesso')
    },
    onError: (error: Error) => {
      toast.error('Erro ao criar meta financeira: ' + error.message)
    }
  })
}

export function useUpdateFinancialGoal() {
  const api = useApi()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ goalId, data }: { goalId: string; data: Partial<MetaFinanceira> }) =>
      api.updateFinancialGoal(goalId, data),
    onSuccess: (_, { goalId }) => {
      queryClient.invalidateQueries({ queryKey: ['financial-goals'] })
      queryClient.invalidateQueries({ queryKey: ['financial-goals', goalId] })
      toast.success('Meta financeira atualizada com sucesso')
    },
    onError: (error: Error) => {
      toast.error('Erro ao atualizar meta financeira: ' + error.message)
    }
  })
}

export function useDeleteFinancialGoal() {
  const api = useApi()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: api.deleteFinancialGoal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial-goals'] })
      toast.success('Meta financeira excluída com sucesso')
    },
    onError: (error: Error) => {
      toast.error('Erro ao excluir meta financeira: ' + error.message)
    }
  })
}
