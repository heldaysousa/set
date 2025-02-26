/**
 * @fileoverview Serviço de agendamento
 * @status 🚧 Em desenvolvimento
 */

import { supabase } from '@/lib/supabase'
import { addMinutes, isBefore, isAfter, startOfDay, endOfDay, eachDayOfInterval } from 'date-fns'
import type {
  TimeSlot,
  ServiceType,
  Professional,
  Appointment,
  SchedulingConfig,
  SchedulingError,
} from '@/types/scheduling'
import { Professional as DatabaseProfessional } from '@/lib/types/database'

interface WorkingHours {
  start: string
  end: string
  break_start?: string
  break_end?: string
}

interface Schedule {
  [key: number]: WorkingHours
}

export class SchedulingService {
  private business_id: string
  private config: SchedulingConfig | null = null

  constructor(business_id: string) {
    this.business_id = business_id
  }

  // Inicialização e configuração
  async initialize(): Promise<void> {
    const { data, error } = await supabase
      .from('scheduling_config')
      .select('*')
      .eq('business_id', this.business_id)
      .single()

    if (error) throw error
    this.config = data
  }

  // Busca de horários disponíveis
  async getAvailableSlots(
    professional: DatabaseProfessional,
    date: string
  ): Promise<string[]> {
    const schedule = professional.schedule as Schedule
    const workingHours = schedule[new Date(date).getDay()]

    if (!workingHours) {
      return []
    }

    // Converter horários para minutos desde meia-noite
    const startMinutes = this.timeToMinutes(workingHours.start)
    const endMinutes = this.timeToMinutes(workingHours.end)
    const breakStartMinutes = workingHours.break_start ? this.timeToMinutes(workingHours.break_start) : null
    const breakEndMinutes = workingHours.break_end ? this.timeToMinutes(workingHours.break_end) : null

    // Buscar agendamentos existentes
    const { data: appointments } = await supabase
      .from('appointments')
      .select('start_time, end_time')
      .eq('professional_id', professional.id)
      .eq('business_id', this.business_id)
      .gte('start_time', `${date}T00:00:00`)
      .lte('end_time', `${date}T23:59:59`)

    // Criar slots disponíveis
    const slots: string[] = []
    const interval = 30 // intervalo em minutos

    for (let minutes = startMinutes; minutes < endMinutes; minutes += interval) {
      // Pular horário de intervalo
      if (breakStartMinutes && breakEndMinutes && 
          minutes >= breakStartMinutes && minutes < breakEndMinutes) {
        continue
      }

      const slotTime = this.minutesToTime(minutes)
      const slotDateTime = `${date}T${slotTime}:00`

      // Verificar se o slot não conflita com agendamentos existentes
      const isAvailable = !appointments?.some(appointment => {
        const appointmentStart = new Date(appointment.start_time)
        const appointmentEnd = new Date(appointment.end_time)
        const slotDate = new Date(slotDateTime)
        return slotDate >= appointmentStart && slotDate < appointmentEnd
      })

      if (isAvailable) {
        slots.push(slotDateTime)
      }
    }

    return slots
  }

  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number)
    return hours * 60 + minutes
  }

  private minutesToTime(minutes: number): string {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
  }

  // Criar agendamento
  async createAppointment(
    customer_id: string,
    service_id: string,
    professional_id: string,
    start_time: string,
  ): Promise<Appointment> {
    try {
      // Verificar configurações
      if (!this.config) await this.initialize()

      // Validar horário mínimo de antecedência
      const now = new Date()
      const appointmentStart = new Date(start_time)
      const minNoticeDate = addMinutes(now, this.config!.min_scheduling_notice * 60)

      if (isBefore(appointmentStart, minNoticeDate)) {
        throw this.createError(
          'MINIMUM_NOTICE',
          `Agendamento deve ser feito com ${this.config!.min_scheduling_notice}h de antecedência`
        )
      }

      // Buscar serviço
      const { data: service } = await supabase
        .from('services')
        .select('*')
        .eq('id', service_id)
        .single()

      if (!service) {
        throw this.createError('INVALID_SERVICE', 'Serviço não encontrado')
      }

      // Calcular horário de término
      const end_time = addMinutes(appointmentStart, service.duration).toISOString()

      // Verificar disponibilidade
      const slots = await this.getAvailableSlots(
        professional_id,
        appointmentStart.toISOString().split('T')[0]
      )

      const isAvailable = slots.some(
        (slot) =>
          slot === start_time
      )

      if (!isAvailable) {
        throw this.createError('UNAVAILABLE_SLOT', 'Horário não disponível')
      }

      // Criar agendamento
      const { data: appointment, error } = await supabase
        .from('appointments')
        .insert({
          business_id: this.business_id,
          customer_id,
          service_id,
          professional_id,
          start_time,
          end_time,
          status: this.config?.auto_confirm ? 'confirmed' : 'scheduled',
          payment_status: 'pending',
        })
        .select()
        .single()

      if (error) throw error
      return appointment
    } catch (error) {
      if (this.isSchedulingError(error)) throw error
      throw this.createError('ALREADY_BOOKED', 'Erro ao criar agendamento')
    }
  }

  // Atualizar status do agendamento
  async updateAppointmentStatus(
    appointment_id: string,
    status: Appointment['status']
  ): Promise<void> {
    const { error } = await supabase
      .from('appointments')
      .update({ status })
      .eq('id', appointment_id)
      .eq('business_id', this.business_id)

    if (error) throw error
  }

  // Utilitários
  private createError(
    code: SchedulingError['code'],
    message: string,
    details?: any
  ): SchedulingError {
    return { code, message, details }
  }

  private isSchedulingError(error: any): error is SchedulingError {
    return 'code' in error && 'message' in error
  }
}
