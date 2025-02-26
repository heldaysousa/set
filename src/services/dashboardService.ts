import { PrismaClient } from '@prisma/client'
import { startOfDay, endOfDay, startOfMonth, endOfMonth, subDays, format } from 'date-fns'
import { 
  DashboardMetrics, 
  DashboardFilters, 
  Agendamento, 
  Faturamento,
  MetaFaturamento 
} from '@/types/dashboard'

const prisma = new PrismaClient()

export class DashboardService {
  async getMetrics(filters: DashboardFilters): Promise<DashboardMetrics> {
    const hoje = new Date()
    const inicioHoje = startOfDay(hoje)
    const fimHoje = endOfDay(hoje)
    const inicioMes = startOfMonth(hoje)
    const fimMes = endOfMonth(hoje)

    // Busca agendamentos do dia
    const agendamentosDia = await prisma.agendamento.findMany({
      where: {
        businessId: filters.businessId,
        data: {
          gte: inicioHoje,
          lte: fimHoje
        },
        status: {
          in: filters.incluirCancelados 
            ? ['agendado', 'confirmado', 'cancelado', 'concluido']
            : ['agendado', 'confirmado', 'concluido']
        }
      },
      include: {
        servico: true,
        cliente: true,
        profissional: true
      }
    })

    // Busca agendamentos do mês
    const agendamentosMes = await prisma.agendamento.findMany({
      where: {
        businessId: filters.businessId,
        data: {
          gte: inicioMes,
          lte: fimMes
        },
        status: {
          in: filters.incluirCancelados 
            ? ['agendado', 'confirmado', 'cancelado', 'concluido']
            : ['agendado', 'confirmado', 'concluido']
        }
      }
    })

    // Busca faturamento do dia
    const faturamentoDia = await prisma.faturamento.findMany({
      where: {
        businessId: filters.businessId,
        data: {
          gte: inicioHoje,
          lte: fimHoje
        },
        status: 'confirmado',
        tipo: 'receita'
      }
    })

    // Busca faturamento do mês
    const faturamentoMes = await prisma.faturamento.findMany({
      where: {
        businessId: filters.businessId,
        data: {
          gte: inicioMes,
          lte: fimMes
        },
        status: 'confirmado',
        tipo: 'receita'
      }
    })

    // Busca meta de faturamento do mês
    const metaFaturamento = await prisma.metaFaturamento.findFirst({
      where: {
        businessId: filters.businessId,
        mes: hoje.getMonth() + 1,
        ano: hoje.getFullYear()
      }
    })

    // Calcula distribuição de serviços
    const servicosPorCategoria = agendamentosMes.reduce((acc, curr) => {
      const categoria = curr.servicoNome
      if (!acc[categoria]) {
        acc[categoria] = {
          nome: categoria,
          valor: 0,
          quantidade: 0
        }
      }
      acc[categoria].valor += curr.valor
      acc[categoria].quantidade += 1
      return acc
    }, {} as Record<string, { nome: string; valor: number; quantidade: number }>)

    const totalServicos = Object.values(servicosPorCategoria).reduce(
      (acc, curr) => acc + curr.valor,
      0
    )

    const distribuicaoServicos = Object.values(servicosPorCategoria).map(
      (servico) => ({
        nome: servico.nome,
        valor: servico.valor,
        porcentagem: (servico.valor / totalServicos) * 100
      })
    )

    // Calcula taxa de efetivação
    const agendamentosConcluidos = agendamentosMes.filter(
      (a) => a.status === 'concluido'
    ).length
    const totalAgendamentos = agendamentosMes.length
    const taxaEfetivacao = totalAgendamentos > 0
      ? (agendamentosConcluidos / totalAgendamentos) * 100
      : 0

    // Calcula previsão de faturamento
    const valorAgendamentosHoje = agendamentosDia.reduce(
      (acc, curr) => acc + curr.valor,
      0
    )

    const faturamentoOntem = await prisma.faturamento.findMany({
      where: {
        businessId: filters.businessId,
        data: {
          gte: startOfDay(subDays(hoje, 1)),
          lte: endOfDay(subDays(hoje, 1))
        },
        status: 'confirmado',
        tipo: 'receita'
      }
    })

    const valorFaturamentoOntem = faturamentoOntem.reduce(
      (acc, curr) => acc + curr.valor,
      0
    )

    const crescimento = valorFaturamentoOntem > 0
      ? ((valorAgendamentosHoje - valorFaturamentoOntem) / valorFaturamentoOntem) * 100
      : 0

    // Calcula métricas do dashboard
    const metrics: DashboardMetrics = {
      faturamentoDiario: faturamentoDia.reduce((acc, curr) => acc + curr.valor, 0),
      faturamentoMensal: faturamentoMes.reduce((acc, curr) => acc + curr.valor, 0),
      agendamentosDia: agendamentosDia.length,
      agendamentosMes: agendamentosMes.length,
      taxaEfetivacao,
      metaFaturamento: {
        mensal: {
          meta: metaFaturamento?.valor || 0,
          atual: faturamentoMes.reduce((acc, curr) => acc + curr.valor, 0),
          percentual: metaFaturamento?.valor
            ? (faturamentoMes.reduce((acc, curr) => acc + curr.valor, 0) / metaFaturamento.valor) * 100
            : 0
        },
        diaria: {
          meta: metaFaturamento?.valor 
            ? metaFaturamento.valor / new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).getDate()
            : 0,
          atual: faturamentoDia.reduce((acc, curr) => acc + curr.valor, 0),
          percentual: metaFaturamento?.valor
            ? (faturamentoDia.reduce((acc, curr) => acc + curr.valor, 0) / 
              (metaFaturamento.valor / new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).getDate())) * 100
            : 0
        }
      },
      distribuicaoServicos,
      previsaoFaturamento: {
        valor: valorAgendamentosHoje,
        crescimento
      }
    }

    return metrics
  }

  async getProximosAgendamentos(businessId: string): Promise<Agendamento[]> {
    const hoje = new Date()
    const agendamentos = await prisma.agendamento.findMany({
      where: {
        businessId,
        data: {
          gte: startOfDay(hoje)
        },
        status: {
          in: ['agendado', 'confirmado']
        }
      },
      include: {
        servico: true,
        cliente: true,
        profissional: true
      },
      orderBy: {
        data: 'asc'
      },
      take: 5
    })

    return agendamentos.map(a => ({
      ...a,
      horario: format(a.data, 'HH:mm'),
      clienteNome: a.cliente.nome,
      servicoNome: a.servico.nome,
      profissionalNome: a.profissional.nome
    }))
  }

  async getFaturamentoHistorico(filters: DashboardFilters): Promise<Array<{data: string; valor: number}>> {
    const faturamento = await prisma.faturamento.findMany({
      where: {
        businessId: filters.businessId,
        data: {
          gte: filters.dataInicio,
          lte: filters.dataFim
        },
        status: 'confirmado',
        tipo: 'receita'
      },
      orderBy: {
        data: 'asc'
      }
    })

    return faturamento.map(f => ({
      data: format(f.data, 'dd/MM/yyyy'),
      valor: f.valor
    }))
  }
}
