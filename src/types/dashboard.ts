export interface Agendamento {
  id: string
  clienteId: string
  clienteNome: string
  servicoId: string
  servicoNome: string
  profissionalId: string
  profissionalNome: string
  data: Date
  horario: string
  valor: number
  status: 'agendado' | 'confirmado' | 'cancelado' | 'concluido'
  formaPagamento?: string
  observacoes?: string
  createdAt: Date
  updatedAt: Date
}

export interface Servico {
  id: string
  nome: string
  valor: number
  duracao: number
  categoria: string
  comissao: number
  createdAt: Date
  updatedAt: Date
}

export interface MetaFaturamento {
  id: string
  businessId: string
  mes: number
  ano: number
  valor: number
  atual: number
  createdAt: Date
  updatedAt: Date
}

export interface Faturamento {
  id: string
  businessId: string
  data: Date
  valor: number
  tipo: 'receita' | 'despesa'
  categoria: string
  formaPagamento: string
  status: 'pendente' | 'confirmado' | 'cancelado'
  createdAt: Date
  updatedAt: Date
}

export interface DashboardMetrics {
  appointments: Array<{
    id: string
    start_time: string
    end_time: string
    service?: {
      price: number
    }
  }>
  totalClients: number
  totalServices: number
  revenue: number
}

export interface DashboardFilters {
  businessId: string
  dataInicio: Date
  dataFim: Date
  incluirCancelados?: boolean
}

export interface FaturamentoHistorico {
  data: string
  valor: number
  mes: string
}

export interface HistoricalData {
  revenueData: Array<{
    name: string
    value: number
  }>
  pieData: Array<{
    name: string
    value: number
  }>
}
