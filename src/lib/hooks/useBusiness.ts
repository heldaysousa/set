import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { BusinessAPI } from '@/lib/api/business'
import type { Business, BusinessSettings } from '@/lib/types/database'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'sonner'

export function useBusiness() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  // Query para buscar dados do negócio
  const {
    data: business,
    isLoading,
    error
  } = useQuery({
    queryKey: ['business', user?.business_id],
    queryFn: () => BusinessAPI.getById(user?.business_id!),
    enabled: !!user?.business_id,
  })

  // Mutation para atualizar dados do negócio
  const updateBusiness = useMutation({
    mutationFn: (data: Partial<Business>) => 
      BusinessAPI.update(user?.business_id!, data),
    onSuccess: (updatedBusiness) => {
      queryClient.setQueryData(['business', user?.business_id], updatedBusiness)
      toast.success('Dados do negócio atualizados com sucesso!')
    },
    onError: (error) => {
      console.error('Erro ao atualizar negócio:', error)
      toast.error('Erro ao atualizar dados do negócio')
    }
  })

  // Mutation para atualizar configurações
  const updateSettings = useMutation({
    mutationFn: (settings: BusinessSettings) =>
      BusinessAPI.updateSettings(user?.business_id!, settings),
    onSuccess: (updatedBusiness) => {
      queryClient.setQueryData(['business', user?.business_id], updatedBusiness)
      toast.success('Configurações atualizadas com sucesso!')
    },
    onError: (error) => {
      console.error('Erro ao atualizar configurações:', error)
      toast.error('Erro ao atualizar configurações')
    }
  })

  // Mutation para completar setup
  const completeSetup = useMutation({
    mutationFn: () => BusinessAPI.completeSetup(user?.business_id!),
    onSuccess: (updatedBusiness) => {
      queryClient.setQueryData(['business', user?.business_id], updatedBusiness)
      toast.success('Configuração inicial concluída!')
    },
    onError: (error) => {
      console.error('Erro ao completar setup:', error)
      toast.error('Erro ao concluir configuração inicial')
    }
  })

  // Verifica se o negócio está configurado
  const checkSetup = async () => {
    if (!user?.business_id) return false
    try {
      return await BusinessAPI.checkSetup(user.business_id)
    } catch (error) {
      console.error('Erro ao verificar setup:', error)
      return false
    }
  }

  return {
    business,
    isLoading,
    error,
    updateBusiness,
    updateSettings,
    completeSetup,
    checkSetup
  }
}
