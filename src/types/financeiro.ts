export interface Transacao {
  id: string
  tipo: 'receita' | 'despesa'
  descricao: string
  valor: number
  data: string
  categoria: string
  formaPagamento: string
  status: 'confirmado' | 'pendente' | 'agendado'
  observacoes?: string
  businessId: string
  createdAt: string
  updatedAt: string
}

export interface ResumoMensal {
  totalReceitas: number
  totalDespesas: number
  saldo: number
  porcentagemVariacao: number
}

export interface MetaReceita {
  id: string
  businessId: string
  mes: number
  ano: number
  valorMeta: number
  valorAtual: number
  porcentagemAlcancada: number
  createdAt: string
  updatedAt: string
}

export interface Categoria {
  id: string
  nome: string
  tipo: 'receita' | 'despesa'
  cor: string
  grupo: string
  ordem?: number
}

export interface FormaPagamento {
  id: string
  nome: string
  ativo: boolean
  padrao?: boolean
}

export interface FiltrosTransacao {
  periodo: 'hoje' | 'semana' | 'mes' | 'ano'
  categoria: string
  status: string
  dataInicio?: string
  dataFim?: string
}

export interface FinanceiroState {
  resumoMensal: ResumoMensal
  metaReceita: MetaReceita
  transacoes: Transacao[]
  categorias: {
    receitas: Categoria[]
    despesas: Categoria[]
  }
  formasPagamento: FormaPagamento[]
  metas: {
    diaria: number
    mensal: number
    anual: number
  }
  isLoading: boolean
  error: string | null
  
  fetchTransacoes: (filtros: FiltrosTransacao) => Promise<void>
  adicionarTransacao: (transacao: Omit<Transacao, 'id' | 'businessId' | 'createdAt' | 'updatedAt'>) => Promise<void>
  atualizarMeta: (meta: Partial<MetaReceita>) => Promise<void>
}
