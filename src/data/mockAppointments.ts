import { addDays, setHours, setMinutes } from 'date-fns'

const hoje = new Date()

export const mockAppointments = [
  {
    client_id: 1, // Maria Silva
    professional_id: 1, // Júlia Almeida
    service_id: 1, // Corte Feminino
    data_inicio: setMinutes(setHours(addDays(hoje, 1), 10), 0).toISOString(), // Amanhã 10:00
    data_fim: setMinutes(setHours(addDays(hoje, 1), 11), 0).toISOString(), // Amanhã 11:00
    status: 'agendado',
    valor: 80.00,
    observacoes: 'Cliente solicitou corte curto'
  },
  {
    client_id: 2, // João Santos
    professional_id: 2, // Rafael Santos
    service_id: 2, // Corte Masculino
    data_inicio: setMinutes(setHours(addDays(hoje, 1), 14), 0).toISOString(), // Amanhã 14:00
    data_fim: setMinutes(setHours(addDays(hoje, 1), 15), 0).toISOString(), // Amanhã 15:00
    status: 'agendado',
    valor: 50.00,
    observacoes: 'Primeira vez no salão'
  },
  {
    client_id: 3, // Ana Oliveira
    professional_id: 3, // Amanda Costa
    service_id: 3, // Coloração
    data_inicio: setMinutes(setHours(addDays(hoje, 2), 9), 0).toISOString(), // Depois de amanhã 09:00
    data_fim: setMinutes(setHours(addDays(hoje, 2), 11), 0).toISOString(), // Depois de amanhã 11:00
    status: 'agendado',
    valor: 150.00,
    observacoes: 'Cliente trouxe referência de cor'
  },
  {
    client_id: 4, // Pedro Costa
    professional_id: 2, // Rafael Santos
    service_id: 2, // Corte Masculino
    data_inicio: setMinutes(setHours(addDays(hoje, 3), 16), 0).toISOString(), // Em 3 dias 16:00
    data_fim: setMinutes(setHours(addDays(hoje, 3), 17), 0).toISOString(), // Em 3 dias 17:00
    status: 'agendado',
    valor: 50.00,
    observacoes: 'Cliente VIP'
  },
  {
    client_id: 5, // Carla Souza
    professional_id: 1, // Júlia Almeida
    service_id: 5, // Hidratação
    data_inicio: setMinutes(setHours(addDays(hoje, 4), 13), 0).toISOString(), // Em 4 dias 13:00
    data_fim: setMinutes(setHours(addDays(hoje, 4), 14), 0).toISOString(), // Em 4 dias 14:00
    status: 'agendado',
    valor: 120.00,
    observacoes: 'Hidratação profunda'
  }
]
