import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { BusinessAPI } from '@/lib/api/business'
import { useAuthStore } from '@/stores/authStore'
import { toast } from 'sonner'

export function useBusiness() {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()

  const { data: business, isLoading: isLoadingBusiness } = useQuery({
    queryKey: ['business', user?.business_id],
    queryFn: () => BusinessAPI.getById(user?.business_id as string),
    enabled: !!user?.business_id,
  })

  const updateBusiness = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => BusinessAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business'] })
    },
    onError: (error) => {
      console.error('Erro ao atualizar negócio:', error)
      toast.error('Erro ao atualizar negócio')
    }
  })

  const updateSettings = useMutation({
    mutationFn: ({ id, settings }: { id: string; settings: any }) => BusinessAPI.updateSettings(id, settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business'] })
      toast.success('Configurações atualizadas com sucesso')
    },
    onError: (error) => {
      console.error('Erro ao atualizar configurações:', error)
      toast.error('Erro ao atualizar configurações')
    }
  })

  const checkSetup = useMutation({
    mutationFn: (id: string) => BusinessAPI.checkSetup(id),
    onSuccess: (isConfigured) => {
      if (!isConfigured) {
        toast.warning('Por favor, complete a configuração do seu negócio')
      }
    },
    onError: (error) => {
      console.error('Erro ao verificar configuração:', error)
      toast.error('Erro ao verificar configuração do negócio')
    }
  })

  const completeSetup = useMutation({
    mutationFn: (id: string) => BusinessAPI.completeSetup(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business'] })
      toast.success('Configuração concluída com sucesso')
    },
    onError: (error) => {
      console.error('Erro ao concluir configuração:', error)
      toast.error('Erro ao concluir configuração do negócio')
    }
  })

  return {
    business,
    isLoading: isLoadingBusiness || updateBusiness.isPending,
    updateBusiness,
    updateSettings,
    checkSetup,
    completeSetup
  }
}
