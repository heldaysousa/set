import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { ClientHistory } from '@/lib/types/supabase'

export function useClientHistory(clientId: string) {
  // Busca o histórico completo do cliente
  const { data: history, isLoading } = useQuery({
    queryKey: ['client-history', clientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('client_history')
        .select(`
          *,
          appointments (
            start_time,
            end_time,
            status
          ),
          services (
            name,
            price,
            duration
          ),
          professionals (
            name,
            specialties
          )
        `)
        .eq('client_id', clientId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Erro ao buscar histórico:', error)
        throw error
      }

      return data as ClientHistory[]
    },
    enabled: !!clientId
  })

  // Busca estatísticas do cliente
  const { data: stats } = useQuery({
    queryKey: ['client-stats', clientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('get_client_stats', { client_id: clientId })

      if (error) {
        console.error('Erro ao buscar estatísticas:', error)
        throw error
      }

      return data as {
        total_appointments: number
        total_spent: number
        favorite_service: string
        favorite_professional: string
        last_visit: string
        avg_ticket: number
      }
    },
    enabled: !!clientId
  })

  // Busca os serviços mais frequentes
  const { data: topServices } = useQuery({
    queryKey: ['client-top-services', clientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('get_client_top_services', { client_id: clientId, limit: 5 })

      if (error) {
        console.error('Erro ao buscar serviços frequentes:', error)
        throw error
      }

      return data as {
        service_name: string
        count: number
        total_spent: number
      }[]
    },
    enabled: !!clientId
  })

  return {
    history,
    stats,
    topServices,
    isLoading
  }
}
