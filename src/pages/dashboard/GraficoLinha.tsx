import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { format, subDays, eachDayOfInterval } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Line } from 'react-chartjs-2'
import { useTheme } from '@/hooks/useTheme'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { motion } from 'framer-motion'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

interface DataPoint {
  data: string
  valor: number
  mes: string
}

interface GraficoLinhaProps {
  data: DataPoint[]
  titulo: string
  descricao?: string
  formatador: (valor: number) => string
}

type PeriodoVisualizacao = '30dias' | '12meses'

export function GraficoLinha({ data, titulo, descricao, formatador }: GraficoLinhaProps) {
  const [periodoSelecionado, setPeriodoSelecionado] = useState<PeriodoVisualizacao>('30dias')
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const dadosFiltrados = useMemo(() => {
    if (periodoSelecionado === '30dias') {
      const hoje = new Date()
      const ultimos30Dias = eachDayOfInterval({
        start: subDays(hoje, 29),
        end: hoje
      })

      return ultimos30Dias.map(dia => {
        const dataFormatada = format(dia, 'yyyy-MM-dd')
        const dadoDia = data.find(d => d.data === dataFormatada)
        return {
          data: format(dia, 'dd/MM', { locale: ptBR }),
          valor: dadoDia?.valor || 0
        }
      })
    } else {
      return data.map(item => ({
        data: item.mes,
        valor: item.valor
      }))
    }
  }, [data, periodoSelecionado])

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: isDark ? 'rgba(0, 0, 0, 0.9)' : 'rgba(255, 255, 255, 0.95)',
        titleColor: isDark ? '#fff' : '#000',
        bodyColor: isDark ? '#fff' : '#000',
        padding: 12,
        displayColors: false,
        borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        borderWidth: 1,
        callbacks: {
          label: (context: any) => formatador(context.parsed.y)
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)',
          font: {
            size: 11,
            weight: '500'
          }
        },
        border: {
          display: false
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
          drawBorder: false
        },
        ticks: {
          callback: (value: number) => formatador(value),
          color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)',
          font: {
            size: 11,
            weight: '500'
          }
        },
        border: {
          display: false
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index'
    },
    elements: {
      line: {
        tension: 0.4
      },
      point: {
        radius: 0,
        hitRadius: 8,
        hoverRadius: 4
      }
    }
  }

  const chartData = {
    labels: dadosFiltrados.map(item => item.data),
    datasets: [
      {
        data: dadosFiltrados.map(item => item.valor),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: isDark 
          ? 'rgba(59, 130, 246, 0.1)' 
          : 'rgba(59, 130, 246, 0.05)',
        fill: true,
        borderWidth: 2
      }
    ]
  }

  return (
    <Card>
      <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-500 pb-6">
        <CardTitle className="text-white flex items-center gap-3">
          <div className="p-2 rounded-lg bg-white/10 backdrop-blur-sm">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 3V21H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M3 12L8 7L13 12L21 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M21 4V8H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="8" cy="7" r="1" stroke="currentColor" strokeWidth="2"/>
              <circle cx="13" cy="12" r="1" stroke="currentColor" strokeWidth="2"/>
              <circle cx="21" cy="4" r="1" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </div>
          <span className="text-xl font-light tracking-tight">Evolução do Faturamento</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="h-[350px]"
        >
          <Line data={chartData} options={options} />
        </motion.div>
      </CardContent>
    </Card>
  )
}
