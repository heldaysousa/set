import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useTheme } from '@/hooks/useTheme'
import { motion } from 'framer-motion'
import { Doughnut } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { differenceInDays, endOfMonth, differenceInHours, format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

ChartJS.register(ArcElement, Tooltip, Legend)

interface MetaCardProps {
  titulo: string
  metaMensal: {
    meta: number
    atual: number
  }
  metaDiaria: {
    meta: number
    atual: number
  }
  formatador?: (valor: number) => string
  showValues?: boolean
}

export function MetaCard({ 
  titulo, 
  metaMensal, 
  metaDiaria,
  formatador = (v) => v.toString(),
  showValues = true
}: MetaCardProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const calcularPorcentagem = (atual: number, meta: number) => {
    return Math.min(Math.round((atual / meta) * 100), 100)
  }

  const getStatusColor = (porcentagem: number) => {
    if (porcentagem >= 100) return '#10B981' // Verde
    if (porcentagem >= 75) return '#3B82F6' // Azul
    if (porcentagem >= 50) return '#F59E0B' // Amarelo
    return '#EF4444' // Vermelho
  }

  const createChartData = (atual: number, meta: number) => ({
    datasets: [{
      data: [atual, Math.max(meta - atual, 0)],
      backgroundColor: [
        getStatusColor(calcularPorcentagem(atual, meta)),
        isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)'
      ],
      borderWidth: 0,
      spacing: 2
    }]
  })

  const chartOptions = {
    responsive: true,
    cutout: '80%',
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        enabled: false
      }
    },
    animation: {
      duration: 1000,
      easing: 'easeOutQuart'
    }
  }

  const formatarValor = (valor: number) => {
    return showValues ? formatador(valor) : '••••••'
  }

  const MetaDisplay = ({ atual, meta, tipo }: { atual: number; meta: number; tipo: 'mensal' | 'diaria' }) => {
    const porcentagem = calcularPorcentagem(atual, meta)
    const diasRestantes = tipo === 'mensal' 
      ? differenceInDays(endOfMonth(new Date()), new Date())
      : differenceInHours(new Date().setHours(23, 59, 59), new Date())
    const valorRestante = Math.max(meta - atual, 0)

    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center space-y-6"
      >
        <div className="relative w-40 h-40">
          <Doughnut 
            data={createChartData(atual, meta)} 
            options={chartOptions}
          />
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, duration: 0.3 }}
            className="absolute inset-0 flex flex-col items-center justify-center"
          >
            <span className="text-2xl font-light tracking-tight" style={{ color: getStatusColor(porcentagem) }}>
              {porcentagem}%
            </span>
            <span className="text-xs font-light text-muted-foreground mt-1">
              da meta {tipo === 'mensal' ? 'mensal' : 'diária'}
            </span>
          </motion.div>
        </div>

        <div className="w-full space-y-3">
          <motion.div 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-2 gap-2"
          >
            <div className="flex flex-col p-2.5 rounded-lg bg-white/5 backdrop-blur-sm">
              <span className="text-xs font-light text-muted-foreground flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-blue-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L20 7V17L12 22L4 17V7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 6L16 8.5V13.5L12 16L8 13.5V8.5L12 6Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="12" cy="11" r="1" stroke="currentColor" strokeWidth="2"/>
                </svg>
                Meta - Objetivo
              </span>
              <span className="text-sm font-medium text-blue-500 mt-1">{formatarValor(meta)}</span>
            </div>

            <div className="flex flex-col p-2.5 rounded-lg bg-white/5 backdrop-blur-sm">
              <span className="text-xs font-light text-muted-foreground flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-emerald-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2"/>
                  <path d="M8 12L11 15L16 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 2V4M12 20V22M2 12H4M20 12H22" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                Faturamento Atual
              </span>
              <span className="text-sm font-medium text-emerald-500 mt-1">{formatarValor(atual)}</span>
            </div>
          </motion.div>

          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col p-2.5 rounded-lg bg-white/5 backdrop-blur-sm"
          >
            <span className="text-xs font-light text-muted-foreground flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-amber-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 8V12L15 15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 2V4M12 20V22M2 12H4M20 12H22" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <circle cx="12" cy="12" r="1" stroke="currentColor" strokeWidth="2"/>
              </svg>
              Para atingir a meta faltam:
            </span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-sm font-medium text-amber-500">{formatarValor(valorRestante)}</span>
              <span className="text-xs font-light text-muted-foreground">
                {tipo === 'mensal' 
                  ? `${diasRestantes} dias restantes` 
                  : `${diasRestantes} horas restantes`}
              </span>
            </div>
          </motion.div>
        </div>
      </motion.div>
    )
  }

  return (
    <Card className="overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-500 pb-6">
          <CardTitle className="text-white flex items-center gap-3">
            <div className="p-2 rounded-lg bg-white/10 backdrop-blur-sm">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L20 7V17L12 22L4 17V7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 6L16 8.5V13.5L12 16L8 13.5V8.5L12 6Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 22V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <circle cx="12" cy="11" r="2" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
            <span className="text-xl font-light tracking-tight">{titulo}</span>
          </CardTitle>
        </CardHeader>
      </motion.div>

      <CardContent className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-light tracking-tight mb-6 flex items-center gap-2">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
                <path d="M3 10H21" stroke="currentColor" strokeWidth="2"/>
                <path d="M16 2L16 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M8 2L8 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M7 14H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M7 18H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              Meta Mensal
            </h3>
            <MetaDisplay
              atual={metaMensal.atual}
              meta={metaMensal.meta}
              tipo="mensal"
            />
          </div>

          <div>
            <h3 className="text-lg font-light tracking-tight mb-6 flex items-center gap-2">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 7V12L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M12 2V4M12 20V22M2 12H4M20 12H22" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <circle cx="12" cy="12" r="1" stroke="currentColor" strokeWidth="2"/>
              </svg>
              Meta Diária
            </h3>
            <MetaDisplay
              atual={metaDiaria.atual}
              meta={metaDiaria.meta}
              tipo="diaria"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
