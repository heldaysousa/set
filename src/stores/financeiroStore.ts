import { create } from 'zustand'
import { mockFinanceiroData } from '@/mocks/financeiroData'
import type { FinanceiroState, FiltrosTransacao, Transacao, MetaReceita } from '@/types/financeiro'
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns'

const calcularDatasDoFiltro = (periodo: FiltrosTransacao['periodo']) => {
  const hoje = new Date()
  
  switch (periodo) {
    case 'hoje':
      return {
        inicio: startOfDay(hoje),
        fim: endOfDay(hoje)
      }
    case 'semana':
      return {
        inicio: startOfWeek(hoje, { weekStartsOn: 1 }),
        fim: endOfWeek(hoje, { weekStartsOn: 1 })
      }
    case 'mes':
      return {
        inicio: startOfMonth(hoje),
        fim: endOfMonth(hoje)
      }
    case 'ano':
      return {
        inicio: startOfYear(hoje),
        fim: endOfYear(hoje)
      }
  }
}

export const useFinanceiroStore = create<FinanceiroState>((set, get) => ({
  resumoMensal: mockFinanceiroData.resumoMensal,
  metaReceita: mockFinanceiroData.metaReceita,
  transacoes: mockFinanceiroData.transacoes,
  categorias: mockFinanceiroData.categorias,
  formasPagamento: mockFinanceiroData.formasPagamento,
  metas: {
    diaria: mockFinanceiroData.metaReceita.valorMeta / 30,
    mensal: mockFinanceiroData.metaReceita.valorMeta,
    anual: mockFinanceiroData.metaReceita.valorMeta * 12
  },
  isLoading: false,
  error: null,

  fetchTransacoes: async (filtros: FiltrosTransacao) => {
    set({ isLoading: true, error: null })

    try {
      // Simula delay da API
      await new Promise(resolve => setTimeout(resolve, 1000))

      const { inicio, fim } = calcularDatasDoFiltro(filtros.periodo)
      
      // Filtra as transações
      let transacoesFiltradas = mockFinanceiroData.transacoes.filter(transacao => {
        const dataTransacao = new Date(transacao.data)
        return dataTransacao >= inicio && dataTransacao <= fim
      })

      // Aplica filtro de categoria
      if (filtros.categoria !== 'todas') {
        transacoesFiltradas = transacoesFiltradas.filter(
          transacao => transacao.categoria === filtros.categoria
        )
      }

      // Aplica filtro de status
      if (filtros.status !== 'todos') {
        transacoesFiltradas = transacoesFiltradas.filter(
          transacao => transacao.status === filtros.status
        )
      }

      // Calcula o resumo mensal
      const totalReceitas = transacoesFiltradas
        .filter(t => t.tipo === 'receita')
        .reduce((total, t) => total + t.valor, 0)

      const totalDespesas = transacoesFiltradas
        .filter(t => t.tipo === 'despesa')
        .reduce((total, t) => total + t.valor, 0)

      const saldo = totalReceitas - totalDespesas

      set({
        transacoes: transacoesFiltradas,
        resumoMensal: {
          totalReceitas,
          totalDespesas,
          saldo,
          porcentagemVariacao: 0 // Seria calculado comparando com período anterior
        },
        isLoading: false
      })
    } catch (error) {
      set({ 
        error: 'Erro ao carregar transações',
        isLoading: false 
      })
    }
  },

  adicionarTransacao: async (transacao: Omit<Transacao, 'id' | 'businessId' | 'createdAt' | 'updatedAt'>) => {
    set({ isLoading: true, error: null })

    try {
      // Simula delay da API
      await new Promise(resolve => setTimeout(resolve, 1000))

      const novaTransacao: Transacao = {
        ...transacao,
        id: Math.random().toString(36).substr(2, 9),
        businessId: '1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      const transacoesAtualizadas = [...get().transacoes, novaTransacao]

      // Atualiza o resumo mensal
      const totalReceitas = transacoesAtualizadas
        .filter(t => t.tipo === 'receita')
        .reduce((total, t) => total + t.valor, 0)

      const totalDespesas = transacoesAtualizadas
        .filter(t => t.tipo === 'despesa')
        .reduce((total, t) => total + t.valor, 0)

      const saldo = totalReceitas - totalDespesas

      // Se for uma receita, atualiza a meta
      if (transacao.tipo === 'receita') {
        const metaAtual = get().metaReceita
        const valorAtual = metaAtual.valorAtual + transacao.valor
        const porcentagemAlcancada = (valorAtual / metaAtual.valorMeta) * 100

        set({
          metaReceita: {
            ...metaAtual,
            valorAtual,
            porcentagemAlcancada
          }
        })
      }

      set({
        transacoes: transacoesAtualizadas,
        resumoMensal: {
          totalReceitas,
          totalDespesas,
          saldo,
          porcentagemVariacao: 0 // Seria calculado comparando com período anterior
        },
        isLoading: false
      })
    } catch (error) {
      set({ 
        error: 'Erro ao adicionar transação',
        isLoading: false 
      })
    }
  },

  atualizarMeta: async (meta: Partial<MetaReceita>) => {
    set({ isLoading: true, error: null })

    try {
      // Simula delay da API
      await new Promise(resolve => setTimeout(resolve, 1000))

      const metaAtual = get().metaReceita
      const metaAtualizada = {
        ...metaAtual,
        ...meta,
        updatedAt: new Date().toISOString()
      }

      set({
        metaReceita: metaAtualizada,
        metas: {
          diaria: metaAtualizada.valorMeta / 30,
          mensal: metaAtualizada.valorMeta,
          anual: metaAtualizada.valorMeta * 12
        },
        isLoading: false
      })
    } catch (error) {
      set({ 
        error: 'Erro ao atualizar meta',
        isLoading: false 
      })
    }
  }
}))
