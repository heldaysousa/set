/**
 * @fileoverview Página principal do dashboard do CEO Express
 */

import React, { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  Calendar,
  DollarSign,
  Users,
  Clock,
  TrendingUp,
  TrendingDown,
  Plus,
  Eye,
  EyeOff,
  Target,
  CheckCircle2
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useDashboardStore } from '@/stores/dashboardStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MetaCard } from './MetaCard'
import { GraficoLinha } from './GraficoLinha'
import { GraficoPizza } from './GraficoPizza'
import { formatarMoeda } from '@/utils/formatters'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

export function DashboardPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { 
    fetchDashboardData, 
    isLoading,
    error,
    metricas,
    faturamentoMensal,
    faturamentoDiario,
    distribuicaoServicos,
    metaFaturamento,
  } = useDashboardStore()
  const [showValues, setShowValues] = useState(true)

  useEffect(() => {
    if (user?.businessId) {
      fetchDashboardData(user.businessId)
    }
  }, [user?.businessId, fetchDashboardData])

  const handleNovoAgendamento = () => {
    try {
      if (!user?.permissions?.includes('schedule:create')) {
        toast.error('Você não tem permissão para criar agendamentos')
        return
      }
      navigate('/agenda/novo')
    } catch (error) {
      toast.error('Não foi possível acessar a página de agendamento')
    }
  }

  const handleNovaReceita = () => {
    try {
      if (!user?.permissions?.includes('finance:create')) {
        toast.error('Você não tem permissão para registrar receitas')
        return
      }
      navigate('/financeiro/receita/novo')
    } catch (error) {
      toast.error('Não foi possível acessar a página de receitas')
    }
  }

  const handleNovaDespesa = () => {
    try {
      if (!user?.permissions?.includes('finance:create')) {
        toast.error('Você não tem permissão para registrar despesas')
        return
      }
      navigate('/financeiro/despesa/novo')
    } catch (error) {
      toast.error('Não foi possível acessar a página de despesas')
    }
  }

  const formatarValor = (valor: number) => {
    return showValues ? formatarMoeda(valor) : '••••••'
  }

  if (isLoading) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center h-screen"
      >
        <div className="w-16 h-16 relative">
          <motion.div
            className="absolute inset-0 border-4 border-blue-500 rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        </div>
      </motion.div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen space-y-4">
        <p className="text-red-500">{error}</p>
        <button 
          onClick={() => fetchDashboardData(user?.businessId || '')}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Tentar Novamente
        </button>
      </div>
    )
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-8 space-y-8"
    >
      {/* Header com Botões */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <motion.div 
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          className="space-y-1"
        >
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            {format(new Date(), "EEEE, dd 'de' MMMM", { locale: ptBR })}
          </p>
        </motion.div>
        
        <div className="flex flex-wrap gap-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleNovaReceita}
            className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-lg shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all duration-200"
          >
            <svg className="h-4 w-4 inline-block mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L20 7V17L12 22L4 17V7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 6L16 8.5V13.5L12 16L8 13.5V8.5L12 6Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 22V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Nova Receita
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleNovaDespesa}
            className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-lg shadow-lg shadow-red-500/20 hover:shadow-red-500/30 transition-all duration-200"
          >
            <svg className="h-4 w-4 inline-block mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2"/>
              <path d="M8 12H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M12 3V7M12 17V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Nova Despesa
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleNovoAgendamento}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all duration-200"
          >
            <svg className="h-4 w-4 inline-block mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
              <path d="M3 10H21" stroke="currentColor" strokeWidth="2"/>
              <path d="M16 2L16 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M8 2L8 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="12" cy="15" r="2" stroke="currentColor" strokeWidth="2"/>
            </svg>
            Novo Agendamento
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowValues(!showValues)}
            className="p-2 bg-gradient-to-r from-gray-600 to-gray-500 text-white rounded-lg shadow-lg shadow-gray-500/20 hover:shadow-gray-500/30 transition-all duration-200"
          >
            {showValues ? (
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 2L22 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M6.71277 6.7226C3.66479 8.79527 2 12 2 12C2 12 5.63636 19 12 19C14.0503 19 15.8174 18.2734 17.2711 17.2884M11 5.05822C11.3254 5.02013 11.6588 5 12 5C18.3636 5 22 12 22 12C22 12 21.3082 13.3317 20 14.8335" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M14 14.2362C13.4692 14.7112 12.7684 15.0001 12 15.0001C10.3431 15.0001 9 13.657 9 12.0001C9 11.1764 9.33193 10.4303 9.86932 9.88818" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            ) : (
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 5C18.3636 5 22 12 22 12C22 12 18.3636 19 12 19C5.63636 19 2 12 2 12C2 12 5.63636 5 12 5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </motion.button>
        </div>
      </div>

      {/* Cards de Métricas */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {[
          {
            title: "Faturamento Mensal",
            value: metricas.faturamentoMensal,
            icon: () => (
              <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L20 7V17L12 22L4 17V7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 6L16 8.5V13.5L12 16L8 13.5V8.5L12 6Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 22V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            ),
            color: "from-blue-600 to-blue-400",
            trend: "+12% este mês"
          },
          {
            title: "Agendamentos do Mês",
            value: metricas.agendamentosMes,
            icon: () => (
              <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
                <path d="M3 10H21" stroke="currentColor" strokeWidth="2"/>
                <path d="M16 2L16 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M8 2L8 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <circle cx="12" cy="15" r="2" stroke="currentColor" strokeWidth="2"/>
              </svg>
            ),
            color: "from-purple-600 to-purple-400",
            trend: "+8% vs. mês anterior",
            suffix: " agendamentos"
          },
          {
            title: "Taxa de Efetivação de Agendamentos",
            value: metricas.taxaEfetivacao,
            icon: () => (
              <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2"/>
                <path d="M8 12L11 15L16 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 2V4M12 20V22M2 12H4M20 12H22" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            ),
            color: "from-emerald-600 to-emerald-400",
            trend: "+5% este mês",
            suffix: "%"
          }
        ].map((card, index) => (
          <motion.div
            key={index}
            whileHover={{ y: -5 }}
            transition={{ duration: 0.2 }}
          >
            <Card className={`bg-gradient-to-br ${card.color} border-none overflow-hidden`}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-white/80 text-sm font-medium">{card.title}</p>
                    <p className="text-2xl font-bold text-white mt-1">
                      {typeof card.value === 'number' && card.title.includes('Faturamento') 
                        ? formatarValor(card.value)
                        : card.value + (card.suffix || '')}
                    </p>
                    <p className="text-sm text-white/60 mt-2">{card.trend}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-white/10">
                    <card.icon />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Metas e Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <motion.div 
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="lg:col-span-8"
        >
          <MetaCard
            titulo="Meta de Faturamento"
            metaMensal={{
              meta: metaFaturamento.meta,
              atual: metaFaturamento.atual
            }}
            metaDiaria={{
              meta: metaFaturamento.meta / 30,
              atual: metricas.faturamentoDiario
            }}
            formatador={formatarMoeda}
            showValues={showValues}
          />
        </motion.div>

        <motion.div 
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="lg:col-span-4"
        >
          <Card className="bg-gradient-to-br from-purple-600 to-purple-400 border-none h-full">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-3">
                <div className="p-2 rounded-lg bg-white/10 backdrop-blur-sm">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
                    <path d="M3 10H21" stroke="currentColor" strokeWidth="2"/>
                    <path d="M16 2L16 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M8 2L8 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <circle cx="12" cy="15" r="2" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </div>
                <span className="text-xl font-light tracking-tight">Próximos Agendamentos</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                {
                  horario: '09:00',
                  cliente: 'Maria Silva',
                  servico: 'Corte + Hidratação',
                  profissional: 'João Santos',
                  valor: 180
                },
                {
                  horario: '11:00',
                  cliente: 'Ana Paula',
                  servico: 'Coloração',
                  profissional: 'Pedro Costa',
                  valor: 250
                },
                {
                  horario: '14:00',
                  cliente: 'Carla Oliveira',
                  servico: 'Manicure + Pedicure',
                  profissional: 'Ana Beatriz',
                  valor: 120
                }
              ].map((agendamento, index) => (
                <motion.div
                  key={index}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex flex-col gap-2 p-4 rounded-lg bg-white/10 hover:bg-white/20 transition-all duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <svg className="h-4 w-4 text-white/80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 7V12L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                      <span className="text-sm font-medium text-white">{agendamento.horario}</span>
                    </div>
                    <span className="text-sm font-medium text-white/80">{formatarValor(agendamento.valor)}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="text-sm text-white/90">{agendamento.cliente}</p>
                    <div className="flex items-center justify-between text-xs text-white/70">
                      <span>{agendamento.servico}</span>
                      <span>•</span>
                      <span>{agendamento.profissional}</span>
                    </div>
                  </div>
                </motion.div>
              ))}

              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mt-2 p-4 rounded-lg bg-emerald-500/20 backdrop-blur-sm border border-emerald-500/20"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-emerald-500/20">
                    <svg className="h-5 w-5 text-emerald-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2L20 7V17L12 22L4 17V7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M12 6L16 8.5V13.5L12 16L8 13.5V8.5L12 6Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <circle cx="12" cy="11" r="2" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Previsão de Faturamento</p>
                    <p className="text-xs text-emerald-300">Total dos agendamentos de hoje</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-medium text-white">
                    {formatarValor([180, 250, 120].reduce((acc, curr) => acc + curr, 0))}
                  </span>
                  <div className="flex items-center gap-2 text-xs text-emerald-300">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 8L12 16M12 8L8 12M12 8L16 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                    <span>+15% vs. ontem</span>
                  </div>
                </div>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Gráficos */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="grid grid-cols-1 lg:grid-cols-12 gap-6"
      >
        <div className="lg:col-span-8">
          <Card className="border-none shadow-xl bg-white/5 backdrop-blur-sm">
            <GraficoLinha
              data={[...faturamentoMensal, ...faturamentoDiario]}
              titulo="Faturamento por Período"
              descricao="Análise comparativa"
              formatador={formatarMoeda}
            />
          </Card>
        </div>
        <div className="lg:col-span-4">
          <Card className="border-none shadow-xl bg-white/5 backdrop-blur-sm">
            <GraficoPizza
              data={distribuicaoServicos}
              titulo="Distribuição de Serviços"
              descricao="Últimos 30 dias"
              formatador={formatarMoeda}
            />
          </Card>
        </div>
      </motion.div>
    </motion.div>
  )
}

export { DashboardPage as default }
