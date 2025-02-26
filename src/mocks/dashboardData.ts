import { addMonths, subMonths, format, subDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'

// Gera dados de faturamento diário dos últimos 30 dias
const gerarFaturamentoDiario = () => {
  const hoje = new Date()
  return Array.from({ length: 30 }).map((_, index) => {
    const data = subDays(hoje, 29 - index)
    return {
      data: format(data, 'yyyy-MM-dd'),
      valor: Math.floor(Math.random() * (5000 - 1000) + 1000),
      mes: format(data, 'MMM', { locale: ptBR })
    }
  })
}

// Gera dados de faturamento mensal dos últimos 12 meses
const gerarFaturamentoMensal = () => {
  const hoje = new Date()
  return Array.from({ length: 12 }).map((_, index) => {
    const data = subMonths(hoje, 11 - index)
    return {
      data: format(data, 'yyyy-MM-dd'),
      valor: Math.floor(Math.random() * (50000 - 30000) + 30000),
      mes: format(data, 'MMM', { locale: ptBR })
    }
  })
}

// Dados de distribuição de serviços
const servicos = [
  { nome: 'Corte', valor: 15000, porcentagem: 30 },
  { nome: 'Coloração', valor: 12500, porcentagem: 25 },
  { nome: 'Manicure', valor: 10000, porcentagem: 20 },
  { nome: 'Tratamentos', valor: 7500, porcentagem: 15 },
  { nome: 'Maquiagem', valor: 5000, porcentagem: 10 }
]

// Dados de comissões dos profissionais
const comissoes = [
  {
    nome: 'Ana Silva',
    cargo: 'Cabeleireira',
    foto: 'https://i.pravatar.cc/150?img=1',
    valorComissao: 4500,
    metaMensal: 8000,
    servicosRealizados: 85
  },
  {
    nome: 'João Santos',
    cargo: 'Barbeiro',
    foto: 'https://i.pravatar.cc/150?img=2',
    valorComissao: 3800,
    metaMensal: 7000,
    servicosRealizados: 72
  },
  {
    nome: 'Maria Oliveira',
    cargo: 'Manicure',
    foto: 'https://i.pravatar.cc/150?img=3',
    valorComissao: 2900,
    metaMensal: 5000,
    servicosRealizados: 95
  },
  {
    nome: 'Pedro Costa',
    cargo: 'Cabeleireiro',
    foto: 'https://i.pravatar.cc/150?img=4',
    valorComissao: 4200,
    metaMensal: 7500,
    servicosRealizados: 78
  }
]

// Dados de agendamentos da semana
const agendamentosSemana = [
  { dia: 'Segunda', total: 24 },
  { dia: 'Terça', total: 32 },
  { dia: 'Quarta', total: 28 },
  { dia: 'Quinta', total: 35 },
  { dia: 'Sexta', total: 40 },
  { dia: 'Sábado', total: 45 },
  { dia: 'Domingo', total: 20 }
]

// Dados das métricas principais
const metricas = {
  faturamentoDiario: 3500,
  agendamentos: 42,
  taxaOcupacao: 85,
  clientesAtivos: 450,
  agendamentosSemana
}

// Dados das metas
const metas = {
  faturamento: {
    meta: 45000,
    atual: 38500
  },
  clientes: {
    meta: 500,
    atual: 450
  }
}

// Dados dos clientes recentes
const clientesRecentes = [
  {
    id: 1,
    nome: 'Mariana Santos',
    email: 'mariana@email.com',
    telefone: '(11) 99999-1111',
    ultimaVisita: '2024-03-15',
    gastoTotal: 850
  },
  {
    id: 2,
    nome: 'Carlos Oliveira',
    email: 'carlos@email.com',
    telefone: '(11) 99999-2222',
    ultimaVisita: '2024-03-14',
    gastoTotal: 620
  },
  {
    id: 3,
    nome: 'Patricia Lima',
    email: 'patricia@email.com',
    telefone: '(11) 99999-3333',
    ultimaVisita: '2024-03-13',
    gastoTotal: 945
  }
]

// Dados das transações recentes
const transacoesRecentes = [
  {
    id: 1,
    tipo: 'receita',
    descricao: 'Pacote completo - Mariana Santos',
    valor: 850,
    data: '2024-03-15',
    status: 'concluido',
    formaPagamento: 'cartão de crédito'
  },
  {
    id: 2,
    tipo: 'despesa',
    descricao: 'Produtos de coloração',
    valor: 1200,
    data: '2024-03-14',
    status: 'concluido',
    formaPagamento: 'transferência'
  },
  {
    id: 3,
    tipo: 'receita',
    descricao: 'Corte e barba - João Silva',
    valor: 120,
    data: '2024-03-14',
    status: 'concluido',
    formaPagamento: 'pix'
  }
]

export const dashboardData = {
  faturamentoMensal: gerarFaturamentoMensal(),
  faturamentoDiario: gerarFaturamentoDiario(),
  distribuicaoServicos: servicos,
  comissoes,
  metricas,
  metaFaturamento: metas.faturamento,
  metaClientes: metas.clientes,
  clientesRecentes,
  transacoesRecentes
}
