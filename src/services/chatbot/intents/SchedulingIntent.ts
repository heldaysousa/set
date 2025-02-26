/**
 * @fileoverview Intent de agendamento para o chatbot
 * @status 🚧 Em desenvolvimento
 */

import type { ChatbotIntent } from '@/types/chatbot'
import { SchedulingService } from '@/services/scheduling/SchedulingService'
import { format, parse } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export const createSchedulingIntent = (business_id: string): ChatbotIntent => {
  const schedulingService = new SchedulingService(business_id)

  return {
    id: 'scheduling',
    business_id,
    name: 'Agendamento',
    patterns: [
      'quero marcar um horário',
      'agendar consulta',
      'marcar atendimento',
      'fazer agendamento',
      'agendar horário',
      'marcar um horário',
      'quero agendar',
    ],
    required_data: [
      {
        key: 'service',
        type: 'text',
        question: 'Qual serviço você gostaria de agendar?',
      },
      {
        key: 'date',
        type: 'date',
        question: 'Para qual data você gostaria de agendar? (formato: DD/MM/YYYY)',
        validation: '^\\d{2}/\\d{2}/\\d{4}$',
      },
      {
        key: 'professional',
        type: 'text',
        question: 'Com qual profissional você gostaria de agendar?',
      },
      {
        key: 'time_slot',
        type: 'text',
        question: 'Qual horário você prefere?',
      },
    ],
    responses: [
      {
        type: 'text',
        content: 'Seu agendamento foi confirmado! Aqui estão os detalhes:',
      },
    ],
    actions: [
      {
        type: 'schedule',
        config: {
          handler: async (data: Record<string, any>) => {
            try {
              // Formatar data
              const date = parse(data.date, 'dd/MM/yyyy', new Date())
              
              // Buscar horários disponíveis
              const slots = await schedulingService.getAvailableSlots(
                date.toISOString(),
                data.service_id,
                data.professional_id
              )

              if (!slots.length) {
                return {
                  success: false,
                  message: 'Não há horários disponíveis para esta data.',
                }
              }

              // Criar agendamento
              const appointment = await schedulingService.createAppointment(
                data.customer_id,
                data.service_id,
                data.professional_id,
                data.time_slot
              )

              // Formatar resposta
              const formattedDate = format(
                new Date(appointment.start_time),
                "dd 'de' MMMM 'às' HH:mm",
                { locale: ptBR }
              )

              return {
                success: true,
                message: `Agendamento confirmado para ${formattedDate}. Seu código é: ${appointment.id}`,
                data: appointment,
              }
            } catch (error: any) {
              return {
                success: false,
                message: error.message || 'Erro ao realizar agendamento.',
              }
            }
          },
        },
      },
    ],
  }
}
