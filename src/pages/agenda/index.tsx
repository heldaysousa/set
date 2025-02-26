import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, addDays, isSameDay, parse, addMinutes } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Calendar, Clock, User, Scissors, MoreVertical, Edit2, Trash2, Grid, List } from 'lucide-react'
import { toast } from 'sonner'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import * as Tabs from '@radix-ui/react-tabs'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { AgendamentoModal } from './AgendamentoModal'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { CalendarioMensal } from './CalendarioMensal'
import type { Appointment, Professional, Service, Client } from '@/lib/supabase'

// Horários disponíveis para agendamento (8h às 20h)
const HORARIOS = Array.from({ length: 13 }, (_, i) => i + 8)

interface AgendamentoCompleto extends Appointment {
  professional: Professional
  service: Service
  client: Client
}

export const Agenda = () => {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [modalAberto, setModalAberto] = useState(false)
  const [agendamentoParaEditar, setAgendamentoParaEditar] = useState<AgendamentoCompleto | null>(null)
  const [agendamentoParaCancelar, setAgendamentoParaCancelar] = useState<AgendamentoCompleto | null>(null)
  const [visualizacao, setVisualizacao] = useState<'semanal' | 'mensal'>('semanal')

  // Buscar agendamentos do mês
  const { data: agendamentos, isLoading } = useQuery({
    queryKey: ['agendamentos', format(selectedDate, 'yyyy-MM')],
    queryFn: async () => {
      const inicio = visualizacao === 'mensal'
        ? startOfMonth(selectedDate)
        : startOfWeek(selectedDate, { locale: ptBR })
      const fim = visualizacao === 'mensal'
        ? endOfMonth(selectedDate)
        : endOfWeek(selectedDate, { locale: ptBR })

      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          professional:professionals(*),
          service:services(*),
          client:clients(*)
        `)
        .eq('business_id', user?.business_id)
        .gte('start_time', inicio.toISOString())
        .lte('end_time', fim.toISOString())
        .order('start_time')

      if (error) throw error
      return data as AgendamentoCompleto[]
    },
  })

  // Gerar dias da semana
  const diasDaSemana = eachDayOfInterval({
    start: startOfWeek(selectedDate, { locale: ptBR }),
    end: endOfWeek(selectedDate, { locale: ptBR })
  })

  // Filtrar agendamentos do dia selecionado
  const agendamentosDoDia = agendamentos?.filter(agendamento => 
    isSameDay(new Date(agendamento.start_time), selectedDate)
  ) || []

  // Mutação para cancelar agendamento
  const mutateAgendamento = useMutation({
    mutationFn: async (data: AgendamentoForm) => {
      const { error } = await supabase
        .from('appointments')
        .upsert({
          id: agendamentoParaEditar?.id,
          business_id: user?.business_id,
          client_id: data.client_id,
          professional_id: data.professional_id,
          service_id: data.service_id,
          start_time: format(
            parse(data.start_time, 'HH:mm', selectedDate),
            "yyyy-MM-dd'T'HH:mm:ssXXX"
          ),
          end_time: format(
            addMinutes(
              parse(data.start_time, 'HH:mm', selectedDate),
              selectedService?.duration || 30
            ),
            "yyyy-MM-dd'T'HH:mm:ssXXX"
          ),
          notes: data.notes,
          status: 'agendado'
        })

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agendamentos'] })
      toast.success(
        agendamentoParaEditar
          ? 'Agendamento atualizado com sucesso!'
          : 'Agendamento criado com sucesso!'
      )
      handleClose()
    },
    onError: (error: Error) => {
      console.error('Erro ao salvar agendamento:', error)
      toast.error('Erro ao salvar agendamento')
    }
  })

  // Mutação para cancelar agendamento
  const cancelarAgendamento = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('appointments')
        .update({ status: 'cancelado' })
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agendamentos'] })
      toast.success('Agendamento cancelado com sucesso!')
      setAgendamentoParaCancelar(null)
    },
    onError: () => {
      toast.error('Erro ao cancelar agendamento')
    }
  })

  const handleCancelarAgendamento = () => {
    if (agendamentoParaCancelar) {
      cancelarAgendamento.mutate(agendamentoParaCancelar.id)
    }
  }

  const handleEditarAgendamento = (agendamento: AgendamentoCompleto) => {
    setAgendamentoParaEditar(agendamento)
    setModalAberto(true)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="page-title mb-1">Agenda</h1>
          <p className="text-text-secondary">
            {format(selectedDate, "EEEE, d 'de' MMMM", { locale: ptBR })}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center bg-background-card rounded-lg p-1">
            <button
              onClick={() => setVisualizacao('semanal')}
              className={`
                flex items-center space-x-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors
                ${visualizacao === 'semanal'
                  ? 'bg-primary-600 text-white'
                  : 'text-text-secondary hover:text-text-primary hover:bg-background-hover'
                }
              `}
            >
              <List className="w-4 h-4" />
              <span>Semana</span>
            </button>
            <button
              onClick={() => setVisualizacao('mensal')}
              className={`
                flex items-center space-x-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors
                ${visualizacao === 'mensal'
                  ? 'bg-primary-600 text-white'
                  : 'text-text-secondary hover:text-text-primary hover:bg-background-hover'
                }
              `}
            >
              <Grid className="w-4 h-4" />
              <span>Mês</span>
            </button>
          </div>
          <Button onClick={() => setModalAberto(true)}>
            <Calendar className="w-4 h-4 mr-2" />
            Novo Agendamento
          </Button>
        </div>
      </div>

      {/* Conteúdo */}
      {isLoading ? (
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600" />
        </div>
      ) : visualizacao === 'mensal' ? (
        <CalendarioMensal
          selectedDate={selectedDate}
          onDateSelect={setSelectedDate}
          onMonthChange={setSelectedDate}
          agendamentos={agendamentos || []}
        />
      ) : (
        <>
          {/* Calendário Semanal */}
          <div className="grid grid-cols-7 gap-2">
            {diasDaSemana.map((dia) => (
              <button
                key={dia.toISOString()}
                onClick={() => setSelectedDate(dia)}
                className={`
                  p-4 rounded-lg text-center transition-all
                  ${isSameDay(dia, selectedDate)
                    ? 'bg-primary-600 text-white'
                    : 'bg-background-card hover:border-border-focus border border-border-default'
                  }
                `}
              >
                <span className="block text-sm text-text-secondary">
                  {format(dia, 'EEE', { locale: ptBR })}
                </span>
                <span className="block text-lg font-semibold mt-1">
                  {format(dia, 'd')}
                </span>
              </button>
            ))}
          </div>

          {/* Grade de Horários */}
          <div className="space-y-2">
            {HORARIOS.map((hora) => {
              const agendamentosNoHorario = agendamentosDoDia.filter(agendamento => 
                new Date(agendamento.start_time).getHours() === hora
              )

              return (
                <div
                  key={hora}
                  className="grid grid-cols-[100px_1fr] gap-4"
                >
                  <div className="text-text-secondary text-sm py-2">
                    {String(hora).padStart(2, '0')}:00
                  </div>
                  <div className="space-y-2">
                    {agendamentosNoHorario.map((agendamento) => (
                      <div
                        key={agendamento.id}
                        className="card flex items-center space-x-4 p-4 group"
                      >
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <User className="w-4 h-4 text-text-secondary" />
                              <span className="font-medium">
                                {agendamento.client.name}
                              </span>
                            </div>
                            <DropdownMenu.Root>
                              <DropdownMenu.Trigger asChild>
                                <button className="p-1 rounded-md hover:bg-background-hover opacity-0 group-hover:opacity-100 transition-opacity">
                                  <MoreVertical className="w-4 h-4 text-text-secondary" />
                                </button>
                              </DropdownMenu.Trigger>
                              <DropdownMenu.Portal>
                                <DropdownMenu.Content className="bg-background-card rounded-lg shadow-lg p-2 space-y-1 min-w-[160px] animate-fade-in">
                                  <DropdownMenu.Item
                                    className="flex items-center space-x-2 px-3 py-2 text-sm rounded-md hover:bg-background-hover cursor-pointer outline-none"
                                    onClick={() => handleEditarAgendamento(agendamento)}
                                  >
                                    <Edit2 className="w-4 h-4" />
                                    <span>Editar</span>
                                  </DropdownMenu.Item>
                                  <DropdownMenu.Item
                                    className="flex items-center space-x-2 px-3 py-2 text-sm rounded-md hover:bg-background-hover text-status-error cursor-pointer outline-none"
                                    onClick={() => setAgendamentoParaCancelar(agendamento)}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                    <span>Cancelar</span>
                                  </DropdownMenu.Item>
                                </DropdownMenu.Content>
                              </DropdownMenu.Portal>
                            </DropdownMenu.Root>
                          </div>
                          <div className="mt-1 flex items-center space-x-4 text-sm text-text-secondary">
                            <div className="flex items-center space-x-1">
                              <Scissors className="w-4 h-4" />
                              <span>{agendamento.service.name}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="w-4 h-4" />
                              <span>{agendamento.service.duration}min</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">
                            {agendamento.professional.name}
                          </div>
                          <div className="text-sm text-text-secondary">
                            R$ {agendamento.service.price.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}

      <AgendamentoModal
        isOpen={modalAberto}
        onClose={() => {
          setModalAberto(false)
          setAgendamentoParaEditar(null)
        }}
        selectedDate={selectedDate}
        agendamento={agendamentoParaEditar}
      />

      <ConfirmDialog
        isOpen={!!agendamentoParaCancelar}
        onClose={() => setAgendamentoParaCancelar(null)}
        onConfirm={handleCancelarAgendamento}
        title="Cancelar Agendamento"
        description="Tem certeza que deseja cancelar este agendamento? Esta ação não pode ser desfeita."
        confirmText="Cancelar Agendamento"
        cancelText="Voltar"
      />
    </div>
  )
}
