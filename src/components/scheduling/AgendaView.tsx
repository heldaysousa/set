/**
 * @fileoverview Visualização da agenda de agendamentos
 * @status 🚧 Em desenvolvimento
 */

import { useEffect, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { format, startOfWeek, endOfWeek, eachDayOfInterval, addWeeks, subWeeks } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import type { Appointment } from '@/types/scheduling'
import { NewAppointmentForm } from './NewAppointmentForm'
import { Card } from '@/components/ui/card'
import { monitoring } from '@/services/monitoring'
import { clsx } from 'clsx'

interface AuthContextData {
  business: {
    id: string
  }
}

export function AgendaView() {
  const { business } = useAuth() as AuthContextData
  const queryClient = useQueryClient()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [isNewAppointmentOpen, setIsNewAppointmentOpen] = useState(false)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Buscar agendamentos da semana
  const { data: queryAppointments } = useQuery({
    queryKey: ['appointments', business?.id, currentDate],
    queryFn: async () => {
      const start = startOfWeek(currentDate, { locale: ptBR })
      const end = endOfWeek(currentDate, { locale: ptBR })

      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          professional:professionals(name),
          service:services(name),
          customer:customers(name)
        `)
        .eq('business_id', business?.id)
        .gte('start_time', start.toISOString())
        .lte('end_time', end.toISOString())
        .order('start_time')

      if (error) throw error
      return data
    },
    enabled: !!business?.id,
  })

  // Gerar dias da semana
  const weekDays = eachDayOfInterval({
    start: startOfWeek(currentDate, { locale: ptBR }),
    end: endOfWeek(currentDate, { locale: ptBR }),
  })

  useEffect(() => {
    async function loadAppointments() {
      try {
        monitoring.markStart('load_appointments')
        const { data, error } = await supabase
          .from('appointments')
          .select('*')
          .eq('business_id', business?.id)
          .gte('start_time', format(new Date(), 'yyyy-MM-dd'))
          .order('start_time', { ascending: true })

        if (error) throw error

        setAppointments(data || [])
      } catch (error) {
        console.error('Erro ao carregar agendamentos:', error)
        monitoring.trackError({
          level: 'error',
          message: 'Erro ao carregar agendamentos',
          error: error instanceof Error ? error : new Error('Erro desconhecido'),
        })
      } finally {
        setIsLoading(false)
        monitoring.markEnd('load_appointments')
      }
    }

    loadAppointments()
  }, [business?.id])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Carregando agendamentos...</p>
      </div>
    )
  }

  if (appointments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-muted-foreground mb-4">
          Nenhum agendamento para hoje
        </p>
        <Button variant="outline">Novo Agendamento</Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setCurrentDate(date => subWeeks(date, 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            onClick={() => setCurrentDate(date => addWeeks(date, 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          <span className="text-lg font-semibold">
            {format(currentDate, "MMMM 'de' yyyy", { locale: ptBR })}
          </span>
        </div>

        <Dialog open={isNewAppointmentOpen} onOpenChange={setIsNewAppointmentOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Agendamento
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo Agendamento</DialogTitle>
            </DialogHeader>
            <NewAppointmentForm
              onSuccess={() => {
                setIsNewAppointmentOpen(false)
                queryClient.invalidateQueries({ queryKey: ['appointments'] })
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Calendário */}
      <div className="grid grid-cols-7 gap-4">
        {/* Cabeçalho dos dias */}
        {weekDays.map(day => (
          <div
            key={day.toISOString()}
            className="text-center p-2 font-semibold border-b"
          >
            {format(day, 'EEEE', { locale: ptBR })}
          </div>
        ))}

        {/* Slots de horário */}
        {weekDays.map(day => (
          <div
            key={day.toISOString()}
            className="min-h-[200px] p-2 border rounded-lg"
          >
            <div className="text-sm text-muted-foreground text-center">
              {format(day, 'd', { locale: ptBR })}
            </div>

            <div className="space-y-2 mt-2">
              {appointments
                ?.filter(apt => apt.start_time.startsWith(format(day, 'yyyy-MM-dd')))
                .map(appointment => (
                  <Card key={appointment.id} className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{appointment.customer?.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {appointment.service?.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          com {appointment.professional?.name}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {format(new Date(appointment.start_time), 'HH:mm', {
                            locale: ptBR,
                          })}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(appointment.start_time), "dd 'de' MMMM", {
                            locale: ptBR,
                          })}
                        </p>
                        <span
                          className={clsx(
                            'inline-block px-2 py-1 mt-2 text-xs rounded-full',
                            {
                              'bg-blue-100 text-blue-800': appointment.status === 'scheduled',
                              'bg-green-100 text-green-800': appointment.status === 'completed',
                              'bg-red-100 text-red-800': appointment.status === 'cancelled'
                            }
                          )}
                        >
                          {appointment.status === 'scheduled'
                            ? 'Agendado'
                            : appointment.status === 'completed'
                            ? 'Concluído'
                            : 'Cancelado'}
                        </span>
                      </div>
                    </div>
                  </Card>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
