import React from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { format, eachDayOfInterval, startOfMonth, endOfMonth } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { motion } from 'framer-motion'
import type { AgendamentoCompleto } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp } from 'lucide-react'

interface Agendamento {
  data: string
  total: number
  concluidos: number
  cancelados: number
}

interface GraficoMetricasProps {
  data: Agendamento[]
  titulo: string
  descricao: string
}

const CORES = {
  receita: '#10B981', // Verde vibrante
  agendamentos: '#8B5CF6', // Roxo vibrante
  media: '#F59E0B', // Amarelo vibrante
}

export function GraficoMetricas({ data, titulo, descricao }: GraficoMetricasProps) {
  const totais = {
    total: data.reduce((acc, curr) => acc + curr.total, 0),
    concluidos: data.reduce((acc, curr) => acc + curr.concluidos, 0),
    cancelados: data.reduce((acc, curr) => acc + curr.cancelados, 0),
  }

  return (
    <Card className="bg-[#1F1F23] border-[#2E2E35]">
      <CardHeader>
        <CardTitle className="text-lg font-medium text-white">{titulo}</CardTitle>
        <p className="text-sm text-[#A1A1AA]">{descricao}</p>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2E2E35" />
              <XAxis 
                dataKey="data" 
                stroke="#A1A1AA" 
                fontSize={12}
                tickLine={false}
                axisLine={{ stroke: '#2E2E35' }}
              />
              <YAxis 
                stroke="#A1A1AA" 
                fontSize={12}
                tickLine={false}
                axisLine={{ stroke: '#2E2E35' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F1F23',
                  border: '1px solid #2E2E35',
                  borderRadius: '8px',
                  color: '#fff'
                }}
                itemStyle={{ color: '#fff' }}
                labelStyle={{ color: '#A1A1AA' }}
              />
              <Bar 
                dataKey="total" 
                name="Total" 
                fill="#3B82F6" 
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                dataKey="concluidos" 
                name="Concluídos" 
                fill="#10B981" 
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                dataKey="cancelados" 
                name="Cancelados" 
                fill="#EF4444" 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-4">
          <div className="flex flex-col items-center p-3 bg-[#1F1F23] rounded-lg">
            <span className="text-sm text-[#A1A1AA]">Total</span>
            <span className="text-lg font-bold text-[#4F46E5]">{totais.total}</span>
          </div>
          <div className="flex flex-col items-center p-3 bg-[#1F1F23] rounded-lg">
            <span className="text-sm text-[#A1A1AA]">Concluídos</span>
            <span className="text-lg font-bold text-[#22C55E]">{totais.concluidos}</span>
          </div>
          <div className="flex flex-col items-center p-3 bg-[#1F1F23] rounded-lg">
            <span className="text-sm text-[#A1A1AA]">Cancelados</span>
            <span className="text-lg font-bold text-[#EF4444]">{totais.cancelados}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
