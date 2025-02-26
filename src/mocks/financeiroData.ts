import { addDays, subDays } from 'date-fns'
import type { ResumoMensal, MetaReceita, Transacao, Categoria, FormaPagamento } from '@/types/financeiro'

const hoje = new Date()

export const mockFinanceiroData = {
  resumoMensal: {
    totalReceitas: 15750.00,
    totalDespesas: 8920.50,
    saldo: 6829.50,
    porcentagemVariacao: 12.5
  } as ResumoMensal,

  metaReceita: {
    id: '1',
    businessId: '1',
    mes: hoje.getMonth() + 1,
    ano: hoje.getFullYear(),
    valorMeta: 20000.00,
    valorAtual: 15750.00,
    porcentagemAlcancada: 78.75,
    createdAt: hoje.toISOString(),
    updatedAt: hoje.toISOString()
  } as MetaReceita,

  categorias: {
    receitas: [
      // Receita Bruta
      { id: 'servicos', nome: 'Serviços', tipo: 'receita', cor: '#22C55E', grupo: 'Receita Operacional' },
      { id: 'produtos', nome: 'Venda de Produtos', tipo: 'receita', cor: '#3B82F6', grupo: 'Receita Operacional' },
      { id: 'comissoes', nome: 'Comissões Recebidas', tipo: 'receita', cor: '#A855F7', grupo: 'Receita Operacional' },
      
      // Outras Receitas
      { id: 'aluguel', nome: 'Aluguel de Espaço', tipo: 'receita', cor: '#EC4899', grupo: 'Outras Receitas' },
      { id: 'juros', nome: 'Juros Recebidos', tipo: 'receita', cor: '#F59E0B', grupo: 'Outras Receitas' },
      { id: 'outras_receitas', nome: 'Outras Receitas', tipo: 'receita', cor: '#64748B', grupo: 'Outras Receitas' }
    ] as Categoria[],
    
    despesas: [
      // Custos Operacionais
      { id: 'produtos_revenda', nome: 'Produtos para Revenda', tipo: 'despesa', cor: '#EF4444', grupo: 'Custos Operacionais' },
      { id: 'materiais_consumo', nome: 'Materiais de Consumo', tipo: 'despesa', cor: '#F97316', grupo: 'Custos Operacionais' },
      { id: 'comissoes_pagas', nome: 'Comissões Pagas', tipo: 'despesa', cor: '#F59E0B', grupo: 'Custos Operacionais' },
      
      // Despesas com Pessoal
      { id: 'salarios', nome: 'Salários', tipo: 'despesa', cor: '#10B981', grupo: 'Despesas com Pessoal' },
      { id: 'encargos', nome: 'Encargos Sociais', tipo: 'despesa', cor: '#059669', grupo: 'Despesas com Pessoal' },
      { id: 'beneficios', nome: 'Benefícios', tipo: 'despesa', cor: '#047857', grupo: 'Despesas com Pessoal' },
      
      // Despesas Administrativas
      { id: 'aluguel', nome: 'Aluguel', tipo: 'despesa', cor: '#6366F1', grupo: 'Despesas Administrativas' },
      { id: 'energia', nome: 'Energia Elétrica', tipo: 'despesa', cor: '#4F46E5', grupo: 'Despesas Administrativas' },
      { id: 'agua', nome: 'Água', tipo: 'despesa', cor: '#4338CA', grupo: 'Despesas Administrativas' },
      { id: 'internet', nome: 'Internet/Telefone', tipo: 'despesa', cor: '#3730A3', grupo: 'Despesas Administrativas' },
      { id: 'software', nome: 'Software/Sistemas', tipo: 'despesa', cor: '#312E81', grupo: 'Despesas Administrativas' },
      
      // Despesas de Marketing
      { id: 'publicidade', nome: 'Publicidade', tipo: 'despesa', cor: '#EC4899', grupo: 'Despesas de Marketing' },
      { id: 'marketing_digital', nome: 'Marketing Digital', tipo: 'despesa', cor: '#DB2777', grupo: 'Despesas de Marketing' },
      { id: 'eventos', nome: 'Eventos/Promoções', tipo: 'despesa', cor: '#BE185D', grupo: 'Despesas de Marketing' },
      
      // Despesas Financeiras
      { id: 'taxas_bancarias', nome: 'Taxas Bancárias', tipo: 'despesa', cor: '#7C3AED', grupo: 'Despesas Financeiras' },
      { id: 'juros_pagos', nome: 'Juros Pagos', tipo: 'despesa', cor: '#6D28D9', grupo: 'Despesas Financeiras' },
      { id: 'taxas_cartao', nome: 'Taxas de Cartão', tipo: 'despesa', cor: '#5B21B6', grupo: 'Despesas Financeiras' },
      
      // Impostos
      { id: 'impostos_fixos', nome: 'Impostos Fixos', tipo: 'despesa', cor: '#2563EB', grupo: 'Impostos' },
      { id: 'impostos_variaveis', nome: 'Impostos Variáveis', tipo: 'despesa', cor: '#1D4ED8', grupo: 'Impostos' },
      
      // Outras Despesas
      { id: 'manutencao', nome: 'Manutenção', tipo: 'despesa', cor: '#64748B', grupo: 'Outras Despesas' },
      { id: 'outras_despesas', nome: 'Outras Despesas', tipo: 'despesa', cor: '#475569', grupo: 'Outras Despesas' }
    ] as Categoria[]
  },

  formasPagamento: [
    { id: 'dinheiro', nome: 'Dinheiro', ativo: true, padrao: true },
    { id: 'pix', nome: 'PIX', ativo: true },
    { id: 'credito', nome: 'Cartão de Crédito', ativo: true },
    { id: 'debito', nome: 'Cartão de Débito', ativo: true },
    { id: 'transferencia', nome: 'Transferência', ativo: true },
    { id: 'boleto', nome: 'Boleto', ativo: true }
  ] as FormaPagamento[],

  transacoes: [
    {
      id: '1',
      tipo: 'receita',
      descricao: 'Corte de Cabelo - João Silva',
      valor: 50.00,
      data: hoje.toISOString(),
      categoria: 'servicos',
      formaPagamento: 'pix',
      status: 'confirmado',
      businessId: '1',
      createdAt: hoje.toISOString(),
      updatedAt: hoje.toISOString()
    },
    {
      id: '2',
      tipo: 'receita',
      descricao: 'Venda de Produtos - Maria Santos',
      valor: 150.00,
      data: subDays(hoje, 1).toISOString(),
      categoria: 'produtos',
      formaPagamento: 'credito',
      status: 'confirmado',
      businessId: '1',
      createdAt: subDays(hoje, 1).toISOString(),
      updatedAt: subDays(hoje, 1).toISOString()
    },
    {
      id: '3',
      tipo: 'despesa',
      descricao: 'Aluguel',
      valor: 2000.00,
      data: subDays(hoje, 2).toISOString(),
      categoria: 'aluguel',
      formaPagamento: 'transferencia',
      status: 'confirmado',
      businessId: '1',
      createdAt: subDays(hoje, 2).toISOString(),
      updatedAt: subDays(hoje, 2).toISOString()
    },
    {
      id: '4',
      tipo: 'despesa',
      descricao: 'Marketing Digital',
      valor: 500.00,
      data: subDays(hoje, 3).toISOString(),
      categoria: 'marketing_digital',
      formaPagamento: 'credito',
      status: 'pendente',
      businessId: '1',
      createdAt: subDays(hoje, 3).toISOString(),
      updatedAt: subDays(hoje, 3).toISOString()
    }
  ] as Transacao[]
}
