import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { format, startOfDay, endOfDay, isWithinInterval } from 'date-fns'
import { utcToZonedTime, zonedTimeToUtc } from 'date-fns-tz'
import { supabase } from '@/lib/api'
import type { Appointment } from '@/types/scheduling'
import { monitoring } from '@/services/monitoring'

interface UseSchedulingOptions {
  businessId: string
  date: Date
}

interface CreateAppointmentData {
  customerId: string
  professionalId: string
  serviceId: string
  startTime: Date
  endTime: Date
  notes?: string
}

export function useScheduling({ businessId, date }: UseSchedulingOptions) {
  const queryClient = useQueryClient()
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone

  // Buscar agendamentos do dia
  const appointmentsQuery = useQuery({
    queryKey: ['appointments', businessId, format(date, 'yyyy-MM-dd')],
    queryFn: async () => {
      try {
        monitoring.markStart('fetch_appointments')
        const start = startOfDay(date)
        const end = endOfDay(date)

        const { data, error } = await supabase
          .from('appointments')
          .select(`
            *,
            professional:professionals(name),
            service:services(name),
            customer:customers(name)
          `)
          .eq('business_id', businessId)
          .gte('start_time', zonedTimeToUtc(start, timeZone).toISOString())
          .lte('end_time', zonedTimeToUtc(end, timeZone).toISOString())
          .order('start_time')

        if (error) throw error

        // Converter UTC para timezone local
        return data?.map(appointment => ({
          ...appointment,
          start_time: utcToZonedTime(appointment.start_time, timeZone),
          end_time: utcToZonedTime(appointment.end_time, timeZone)
        })) as Appointment[]
      } catch (error) {
        monitoring.trackError({
          level: 'error',
          message: 'Erro ao buscar agendamentos',
          error: error instanceof Error ? error : new Error('Erro desconhecido')
        })
        throw error
      } finally {
        monitoring.markEnd('fetch_appointments')
      }
    }
  })

  // Criar novo agendamento
  const createAppointment = useMutation({
    mutationFn: async (data: CreateAppointmentData) => {
      try {
        monitoring.markStart('create_appointment')

        // Validar conflito de horários
        const existingAppointments = appointmentsQuery.data || []
        const hasConflict = existingAppointments.some(appointment => 
          isWithinInterval(data.startTime, {
            start: new Date(appointment.start_time),
            end: new Date(appointment.end_time)
          }) ||
          isWithinInterval(data.endTime, {
            start: new Date(appointment.start_time),
            end: new Date(appointment.end_time)
          })
        )

        if (hasConflict) {
          throw new Error('Já existe um agendamento neste horário')
        }

        // Converter para UTC antes de salvar
        const { data: newAppointment, error } = await supabase
          .from('appointments')
          .insert({
            business_id: businessId,
            customer_id: data.customerId,
            professional_id: data.professionalId,
            service_id: data.serviceId,
            start_time: zonedTimeToUtc(data.startTime, timeZone).toISOString(),
            end_time: zonedTimeToUtc(data.endTime, timeZone).toISOString(),
            notes: data.notes,
            status: 'scheduled'
          })
          .select()
          .single()

        if (error) throw error
        return newAppointment
      } catch (error) {
        monitoring.trackError({
          level: 'error',
          message: 'Erro ao criar agendamento',
          error: error instanceof Error ? error : new Error('Erro desconhecido')
        })
        throw error
      } finally {
        monitoring.markEnd('create_appointment')
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] })
    }
  })

  return {
    appointments: appointmentsQuery.data || [],
    isLoading: appointmentsQuery.isLoading,
    error: appointmentsQuery.error,
    createAppointment
  }
}
