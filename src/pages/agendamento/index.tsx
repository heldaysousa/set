import React from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { OnlineScheduling } from '@/components/scheduling/OnlineScheduling'

export function AgendamentoOnline() {
  const { businessId } = useParams()

  // Busca informações do negócio
  const { data: business, isLoading } = useQuery({
    queryKey: ['business', businessId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('id', businessId)
        .single()

      if (error) throw error
      return data
    },
    enabled: !!businessId
  })

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    )
  }

  if (!business) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Estabelecimento não encontrado</h1>
          <p className="mt-2 text-gray-600">
            O estabelecimento que você está procurando não existe ou não está disponível.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-black">
      <div className="container mx-auto py-12">
        {/* Cabeçalho */}
        <div className="text-center mb-12">
          {business.logo_url && (
            <img 
              src={business.logo_url} 
              alt={business.nome}
              className="h-24 w-auto mx-auto mb-6"
            />
          )}
          <h1 className="text-3xl font-bold text-white mb-2">
            {business.nome}
          </h1>
          <p className="text-gray-400">
            {business.endereco}
          </p>
        </div>

        {/* Horários de Funcionamento */}
        <div className="max-w-md mx-auto mb-12 bg-white/10 backdrop-blur-sm rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            Horários de Funcionamento
          </h2>
          <div className="space-y-2">
            {Object.entries(business.business_hours).map(([day, hours]: [string, any]) => (
              <div key={day} className="flex justify-between text-gray-300">
                <span className="capitalize">
                  {day === 'monday' ? 'Segunda' :
                   day === 'tuesday' ? 'Terça' :
                   day === 'wednesday' ? 'Quarta' :
                   day === 'thursday' ? 'Quinta' :
                   day === 'friday' ? 'Sexta' :
                   day === 'saturday' ? 'Sábado' : 'Domingo'}
                </span>
                <span>
                  {hours.start && hours.end ? 
                    `${hours.start} - ${hours.end}` : 
                    'Fechado'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Componente de Agendamento */}
        <div className="max-w-2xl mx-auto">
          <OnlineScheduling businessId={businessId!} />
        </div>
      </div>
    </div>
  )
}
