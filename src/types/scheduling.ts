/**
 * @fileoverview Tipos e interfaces para o sistema de agendamento
 * @status 🚧 Em desenvolvimento
 */

import type { Appointment as DbAppointment, Professional as DbProfessional, Client as DbClient } from '@/lib/types/database'

export type TimeSlot = {
  start: string // ISO DateTime
  end: string   // ISO DateTime
  available: boolean
  professional_id?: string
}

export type ServiceType = {
  id: string
  name: string
  duration: number // em minutos
  price: number
  description?: string
  professional_ids: string[] // profissionais que realizam este serviço
}

export interface WorkingHours {
  start: string
  end: string
  break_start?: string
  break_end?: string
}

export interface Schedule {
  [key: number]: WorkingHours
}

export interface Professional extends DbProfessional {
  working_hours?: Schedule
}

export interface Appointment extends DbAppointment {
  professional: Professional
  service: Service
  client: Client
}

export interface Service {
  id: string
  name: string
  duration: number
  price: number
  description?: string
}

export interface Client extends DbClient {
  // Campos adicionais específicos para agendamento se necessário
}

export type SchedulingConfig = {
  business_id: string
  min_scheduling_notice: number // horas
  max_scheduling_advance: number // dias
  allow_rescheduling: boolean
  reschedule_limit_hours: number
  allow_cancellation: boolean
  cancellation_limit_hours: number
  require_confirmation: boolean
  confirmation_deadline_hours: number
  auto_confirm: boolean
  send_reminders: boolean
  reminder_hours: number[]
  created_at: string
  updated_at: string
}

export type SchedulingError = {
  code: 'UNAVAILABLE_SLOT' | 'INVALID_SERVICE' | 'INVALID_PROFESSIONAL' | 'OUTSIDE_WORKING_HOURS' | 'MINIMUM_NOTICE' | 'MAXIMUM_ADVANCE' | 'ALREADY_BOOKED'
  message: string
  details?: any
}

export interface AgendamentoCompleto extends Appointment {
  // Campos adicionais específicos se necessário
}
