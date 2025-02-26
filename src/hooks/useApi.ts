import { api } from '@/lib/api'
import { useAuthStore } from '@/features/auth/stores/authStore'

export function useApi() {
  const { business } = useAuthStore()

  if (!business) {
    throw new Error('useApi deve ser usado dentro de um contexto autenticado')
  }

  return {
    // Clientes
    getClients: () => api.getClients(business.id),
    getClient: (clientId: string) => api.getClient(clientId),
    createClient: api.createClient,
    updateClient: api.updateClient,
    deleteClient: api.deleteClient,

    // Profissionais
    getProfessionals: () => api.getProfessionals(business.id),
    getProfessional: (professionalId: string) => api.getProfessional(professionalId),
    createProfessional: api.createProfessional,
    updateProfessional: api.updateProfessional,
    deleteProfessional: api.deleteProfessional,

    // Serviços
    getServices: () => api.getServices(business.id),
    getService: (serviceId: string) => api.getService(serviceId),
    createService: api.createService,
    updateService: api.updateService,
    deleteService: api.deleteService,

    // Agendamentos
    getAppointments: (filters?: {
      startDate?: string
      endDate?: string
      clientId?: string
      professionalId?: string
      status?: string
    }) => api.getAppointments(business.id, filters),
    getAppointment: (appointmentId: string) => api.getAppointment(appointmentId),
    createAppointment: api.createAppointment,
    updateAppointment: api.updateAppointment,
    deleteAppointment: api.deleteAppointment,

    // Metas Financeiras
    getFinancialGoals: () => api.getFinancialGoals(business.id),
    getFinancialGoal: (goalId: string) => api.getFinancialGoal(goalId),
    createFinancialGoal: api.createFinancialGoal,
    updateFinancialGoal: api.updateFinancialGoal,
    deleteFinancialGoal: api.deleteFinancialGoal
  }
}
