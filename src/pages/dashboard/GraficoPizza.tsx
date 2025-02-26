import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Doughnut } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { motion } from 'framer-motion'
import { useTheme } from '@/hooks/useTheme'

ChartJS.register(ArcElement, Tooltip, Legend)

interface GraficoPizzaProps {
  data: Array<{
    nome: string
    valor: number
    porcentagem: number
  }>
  titulo: string
  descricao?: string
  formatador: (valor: number) => string
}

export function GraficoPizza({ data, titulo, descricao, formatador }: GraficoPizzaProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const chartData = {
    labels: data.map(item => item.nome),
    datasets: [
      {
        data: data.map(item => item.valor),
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',  // Azul
          'rgba(16, 185, 129, 0.8)',  // Verde
          'rgba(245, 158, 11, 0.8)',  // Âmbar
          'rgba(239, 68, 68, 0.8)',   // Vermelho
          'rgba(139, 92, 246, 0.8)'   // Roxo
        ],
        borderColor: [
          'rgb(59, 130, 246)',
          'rgb(16, 185, 129)',
          'rgb(245, 158, 11)',
          'rgb(239, 68, 68)',
          'rgb(139, 92, 246)'
        ],
        borderWidth: 2,
        hoverOffset: 4
      }
    ]
  }

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
        displayColors: true,
        borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        borderWidth: 1,
        callbacks: {
          label: (context: any) => {
            const label = context.label || ''
            const value = formatador(context.raw)
            const percentage = data[context.dataIndex].porcentagem
            return `${label}: ${value} (${percentage}%)`
          }
        }
      }
    },
    cutout: '65%',
    animation: {
      animateScale: true,
      animateRotate: true
    }
  }

  const total = data.reduce((acc, item) => acc + item.valor, 0)

  return (
    <Card>
      <CardHeader className="bg-gradient-to-r from-purple-600 to-purple-500 pb-6">
        <CardTitle className="text-white flex items-center gap-3">
          <div className="p-2 rounded-lg bg-white/10 backdrop-blur-sm">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2"/>
              <path d="M12 12L12 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M12 12L17 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="12" cy="12" r="1" stroke="currentColor" strokeWidth="2"/>
              <path d="M12 2V4M12 20V22M2 12H4M20 12H22" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="text-xl font-light tracking-tight">Distribuição de Serviços</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative h-[200px]"
        >
          <Doughnut data={chartData} options={options} />
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="text-center">
              <p className="text-sm font-medium text-muted-foreground">Total</p>
              <p className="text-2xl font-bold">{formatador(total)}</p>
            </div>
          </motion.div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6 space-y-2"
        >
          {data.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index }}
              className="flex items-center justify-between p-2 rounded-lg hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: chartData.datasets[0].backgroundColor[index] }}
                />
                <span className="text-sm font-medium">{item.nome}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">{formatador(item.valor)}</span>
                <span className="text-xs font-medium px-2 py-1 rounded-full bg-accent/50">
                  {item.porcentagem}%
                </span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </CardContent>
    </Card>
  )
}
