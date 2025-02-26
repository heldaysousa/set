import { create } from 'zustand'
import { DashboardService } from '@/services/dashboardService'
import { DashboardMetrics, Agendamento } from '@/types/dashboard'
import { startOfMonth, endOfMonth } from 'date-fns'

interface DashboardState {
  isLoading: boolean
  error: string | null
  metricas: DashboardMetrics
  proximosAgendamentos: Agendamento[]
  faturamentoMensal: Array<{data: string; valor: number; mes: string}>
  faturamentoDiario: Array<{data: string; valor: number; mes: string}>
  distribuicaoServicos: Array<{nome: string; valor: number; porcentagem: number}>
  metaFaturamento: {
    meta: number
    atual: number
  }
  fetchDashboardData: (businessId: string) => Promise<void>
}

const dashboardService = new DashboardService()

const estadoInicial: Omit<DashboardState, 'fetchDashboardData'> = {
  isLoading: false,
  error: null,
  metricas: {
    faturamentoDiario: 0,
    faturamentoMensal: 0,
    agendamentosDia: 0,
    agendamentosMes: 0,
    taxaEfetivacao: 0,
    agendamentos: 0,
    metaFaturamento: {
      mensal: {
        meta: 0,
        atual: 0,
        percentual: 0
      },
      diaria: {
        meta: 0,
        atual: 0,
        percentual: 0
      }
    },
    distribuicaoServicos: [],
    previsaoFaturamento: {
      valor: 0,
      crescimento: 0
    }
  },
  proximosAgendamentos: [],
  faturamentoMensal: [],
  faturamentoDiario: [],
  distribuicaoServicos: [],
  metaFaturamento: {
    meta: 0,
    atual: 0
  }
}

export const useDashboardStore = create<DashboardState>((set) => ({
  ...estadoInicial,
  fetchDashboardData: async (businessId: string) => {
    try {
      set({ isLoading: true, error: null })

      const hoje = new Date()
      const inicioMes = startOfMonth(hoje)
      const fimMes = endOfMonth(hoje)

      const [metricas, proximosAgendamentos, faturamentoHistorico] = await Promise.all([
        dashboardService.getMetrics({
          businessId,
          dataInicio: inicioMes,
          dataFim: fimMes
        }),
        dashboardService.getProximosAgendamentos(businessId),
        dashboardService.getFaturamentoHistorico({
          businessId,
          dataInicio: inicioMes,
          dataFim: fimMes
        })
      ])

      set({
        metricas,
        proximosAgendamentos,
        faturamentoMensal: faturamentoHistorico,
        faturamentoDiario: faturamentoHistorico.slice(-30),
        distribuicaoServicos: metricas.distribuicaoServicos,
        metaFaturamento: metricas.metaFaturamento.mensal,
        isLoading: false
      })
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error)
      set({ 
        error: 'Erro ao carregar dados do dashboard',
        isLoading: false 
      })
    }
  }
}))
