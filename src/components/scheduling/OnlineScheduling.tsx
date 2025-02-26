import React, { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'

interface OnlineSchedulingProps {
  businessId: string
}

export function OnlineScheduling({ businessId }: OnlineSchedulingProps) {
  // Busca serviços disponíveis
  const { data: services } = useQuery({
    queryKey: ['services', businessId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('business_id', businessId)
        .eq('available_online', true)
        .order('name')

      if (error) throw error
      return data
    }
  })

  // Busca profissionais disponíveis
  const { data: professionals } = useQuery({
    queryKey: ['professionals', businessId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('professionals')
        .select('*')
        .eq('business_id', businessId)
        .eq('active', true)
        .eq('accepts_online_scheduling', true)
        .order('name')

      if (error) throw error
      return data
    }
  })

  // Busca configurações do Calendly
  const { data: settings } = useQuery({
    queryKey: ['business-settings', businessId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('business_settings')
        .select('calendly_settings')
        .eq('business_id', businessId)
        .single()

      if (error) throw error
      return data
    }
  })

  useEffect(() => {
    // Carrega o script do Calendly
    const script = document.createElement('script')
    script.src = 'https://assets.calendly.com/assets/external/widget.js'
    script.async = true
    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
    }
  }, [])

  // Função para iniciar o agendamento
  const startScheduling = (serviceId: string, professionalId: string) => {
    if (!settings?.calendly_settings?.enabled) {
      toast.error('Agendamento online não está disponível no momento')
      return
    }

    const service = services?.find(s => s.id === serviceId)
    const professional = professionals?.find(p => p.id === professionalId)

    if (!service || !professional) {
      toast.error('Selecione o serviço e o profissional')
      return
    }

    // Abre o widget do Calendly
    // @ts-ignore
    Calendly.initPopupWidget({
      url: professional.calendly_url,
      prefill: {
        customAnswers: {
          a1: service.name,
          a2: service.duration + ' minutos',
          a3: `R$ ${service.price.toFixed(2)}`
        }
      }
    })
  }

  if (!settings?.calendly_settings?.enabled) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Agende Online</CardTitle>
        <CardDescription>
          Escolha o serviço e profissional para agendar seu horário
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Serviço</label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o serviço" />
            </SelectTrigger>
            <SelectContent>
              {services?.map(service => (
                <SelectItem key={service.id} value={service.id}>
                  <div className="flex justify-between items-center w-full">
                    <span>{service.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {service.duration}min - R$ {service.price.toFixed(2)}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Profissional</label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o profissional" />
            </SelectTrigger>
            <SelectContent>
              {professionals?.map(professional => (
                <SelectItem key={professional.id} value={professional.id}>
                  {professional.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button 
          className="w-full"
          onClick={() => startScheduling('service_id', 'professional_id')}
        >
          Agendar Agora
        </Button>
      </CardContent>
    </Card>
  )
}
