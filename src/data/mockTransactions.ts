import { subDays } from 'date-fns'

const hoje = new Date()

export const mockTransactions = [
  // Entradas
  {
    tipo: 'entrada',
    valor: 80.00,
    data: subDays(hoje, 1).toISOString(),
    categoria: 'servicos',
    descricao: 'Corte Feminino - Maria Silva',
    forma_pagamento: 'pix',
    status: 'pago',
    appointment_id: 1
  },
  {
    tipo: 'entrada',
    valor: 50.00,
    data: subDays(hoje, 1).toISOString(),
    categoria: 'servicos',
    descricao: 'Corte Masculino - João Santos',
    forma_pagamento: 'cartao_credito',
    status: 'pago',
    appointment_id: 2
  },
  {
    tipo: 'entrada',
    valor: 150.00,
    data: subDays(hoje, 2).toISOString(),
    categoria: 'servicos',
    descricao: 'Coloração - Ana Oliveira',
    forma_pagamento: 'dinheiro',
    status: 'pago',
    appointment_id: 3
  },
  {
    tipo: 'entrada',
    valor: 300.00,
    data: subDays(hoje, 3).toISOString(),
    categoria: 'produtos',
    descricao: 'Venda de produtos',
    forma_pagamento: 'cartao_debito',
    status: 'pago'
  },

  // Saídas
  {
    tipo: 'saida',
    valor: 800.00,
    data: subDays(hoje, 1).toISOString(),
    categoria: 'aluguel',
    descricao: 'Aluguel do Salão',
    forma_pagamento: 'transferencia',
    status: 'pago',
    data_vencimento: subDays(hoje, 1).toISOString()
  },
  {
    tipo: 'saida',
    valor: 500.00,
    data: subDays(hoje, 2).toISOString(),
    categoria: 'produtos',
    descricao: 'Compra de produtos para revenda',
    forma_pagamento: 'cartao_credito',
    status: 'pago',
    data_vencimento: subDays(hoje, 2).toISOString()
  },
  {
    tipo: 'saida',
    valor: 140.00,
    data: subDays(hoje, 3).toISOString(),
    categoria: 'marketing',
    descricao: 'Impulsionamento nas redes sociais',
    forma_pagamento: 'cartao_credito',
    status: 'pago',
    data_vencimento: subDays(hoje, 3).toISOString()
  },
  {
    tipo: 'saida',
    valor: 250.00,
    data: hoje.toISOString(),
    categoria: 'impostos',
    descricao: 'Taxa mensal MEI',
    forma_pagamento: 'boleto',
    status: 'pendente',
    data_vencimento: addDays(hoje, 5).toISOString()
  }
]
