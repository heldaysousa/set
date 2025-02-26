import React, { useState } from 'react'
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  startOfWeek,
  endOfWeek,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { AgendamentoCompleto } from '@/lib/types'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'

interface CalendarioMensalProps {
  selectedDate: Date
  onDateSelect: (date: Date) => void
  onMonthChange: (date: Date) => void
  agendamentos: AgendamentoCompleto[]
}

export const CalendarioMensal = ({
  selectedDate,
  onDateSelect,
  onMonthChange,
  agendamentos,
}: CalendarioMensalProps) => {
  const diasDaSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
  const primeiroDiaDoMes = startOfMonth(selectedDate)
  const ultimoDiaDoMes = endOfMonth(selectedDate)
  const primeiroDiaDaGrade = startOfWeek(primeiroDiaDoMes, { locale: ptBR })
  const ultimoDiaDaGrade = endOfWeek(ultimoDiaDoMes, { locale: ptBR })

  const diasDoMes = eachDayOfInterval({
    start: primeiroDiaDaGrade,
    end: ultimoDiaDaGrade,
  })

  const getAgendamentosNoDia = (dia: Date) => {
    return agendamentos.filter((agendamento) =>
      isSameDay(new Date(agendamento.start_time), dia)
    )
  }

  return (
    <div className="space-y-4">
      {/* Cabeçalho do Mês */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          {format(selectedDate, "MMMM 'de' yyyy", { locale: ptBR })}
        </h2>
        <div className="flex space-x-2">
          <Button
            variant="secondary"
            onClick={() => onMonthChange(new Date(selectedDate.setMonth(selectedDate.getMonth() - 1)))}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="secondary"
            onClick={() => onMonthChange(new Date(selectedDate.setMonth(selectedDate.getMonth() + 1)))}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Grade do Calendário */}
      <div className="grid grid-cols-7 gap-px bg-border-default rounded-lg overflow-hidden">
        {/* Cabeçalho dos dias da semana */}
        {diasDaSemana.map((dia) => (
          <div
            key={dia}
            className="bg-background-card p-2 text-center text-sm font-medium text-text-secondary"
          >
            {dia}
          </div>
        ))}

        {/* Dias do mês */}
        {diasDoMes.map((dia) => {
          const agendamentosNoDia = getAgendamentosNoDia(dia)
          const isSelected = isSameDay(dia, selectedDate)
          const isCurrentMonth = isSameMonth(dia, selectedDate)
          const isCurrentDay = isToday(dia)

          return (
            <button
              key={dia.toISOString()}
              onClick={() => onDateSelect(dia)}
              className={`
                relative bg-background-card p-2 min-h-[100px] transition-colors
                hover:bg-background-hover
                ${!isCurrentMonth && 'opacity-30'}
                ${isSelected && 'ring-2 ring-primary-600 ring-inset'}
              `}
            >
              <span
                className={`
                  inline-flex items-center justify-center w-6 h-6 text-sm rounded-full
                  ${isCurrentDay && 'bg-primary-600 text-white'}
                `}
              >
                {format(dia, 'd')}
              </span>

              {/* Indicadores de agendamentos */}
              {agendamentosNoDia.length > 0 && (
                <div className="mt-1 space-y-1">
                  {agendamentosNoDia.slice(0, 3).map((agendamento) => (
                    <div
                      key={agendamento.id}
                      className="text-xs truncate text-text-secondary"
                    >
                      {format(new Date(agendamento.start_time), 'HH:mm')} -{' '}
                      {agendamento.client.name}
                    </div>
                  ))}
                  {agendamentosNoDia.length > 3 && (
                    <div className="text-xs text-text-secondary">
                      +{agendamentosNoDia.length - 3} mais
                    </div>
                  )}
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
