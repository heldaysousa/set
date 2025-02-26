import { z } from 'zod'

export const transacaoSchema = z.object({
  tipo: z.enum(['entrada', 'saida']),
  valor: z.number().min(0, 'O valor deve ser maior que zero'),
  data: z.string(),
  data_vencimento: z.string().optional(),
  categoria: z.string().min(1, 'Selecione uma categoria'),
  descricao: z.string().min(1, 'Informe uma descrição'),
  forma_pagamento: z.string().optional(),
  recorrente: z.boolean().default(false),
  comprovante_url: z.string().optional(),
})

export const metasSchema = z.object({
  meta_diaria: z.number().min(0, 'A meta diária deve ser maior que zero'),
  meta_mensal: z.number().min(0, 'A meta mensal deve ser maior que zero'),
  meta_anual: z.number().min(0, 'A meta anual deve ser maior que zero'),
  objetivo_proximo: z.string().min(1, 'Informe o próximo objetivo'),
  valor_objetivo: z.number().min(0, 'O valor do objetivo deve ser maior que zero'),
})

export const categoriaSchema = z.object({
  nome: z.string().min(1, 'Informe o nome da categoria'),
  tipo: z.enum(['entrada', 'saida']),
  cor: z.string(),
  icone: z.string(),
})

export type TransacaoForm = z.infer<typeof transacaoSchema>
export type MetasForm = z.infer<typeof metasSchema>
export type CategoriaForm = z.infer<typeof categoriaSchema>
