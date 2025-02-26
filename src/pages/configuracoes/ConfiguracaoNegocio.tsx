import React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Store, MapPin, Clock, Phone, Mail, Image as ImageIcon } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { toast } from 'sonner'

const diasSemana = [
  { id: 0, nome: 'Domingo' },
  { id: 1, nome: 'Segunda' },
  { id: 2, nome: 'Terça' },
  { id: 3, nome: 'Quarta' },
  { id: 4, nome: 'Quinta' },
  { id: 5, nome: 'Sexta' },
  { id: 6, nome: 'Sábado' },
]

const negocioSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  telefone: z.string().min(10, 'Telefone inválido'),
  email: z.string().email('Email inválido'),
  endereco: z.string().min(5, 'Endereço deve ter pelo menos 5 caracteres'),
  cidade: z.string().min(3, 'Cidade deve ter pelo menos 3 caracteres'),
  estado: z.string().length(2, 'Estado deve ter 2 caracteres'),
  cep: z.string().length(8, 'CEP deve ter 8 caracteres'),
  horario_inicio: z.string(),
  horario_fim: z.string(),
  dias_funcionamento: z.array(z.number()),
  intervalo_agendamento: z.number().min(15, 'Intervalo mínimo de 15 minutos'),
  logo_url: z.string().optional(),
})

type NegocioForm = z.infer<typeof negocioSchema>

export const ConfiguracaoNegocio = () => {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<NegocioForm>({
    resolver: zodResolver(negocioSchema),
  })

  // Buscar dados do negócio
  const { data: business, isLoading } = useQuery({
    queryKey: ['business'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('id', user?.business_id)
        .single()

      if (error) throw error
      return data
    },
  })

  // Atualizar negócio
  const mutation = useMutation({
    mutationFn: async (dados: NegocioForm) => {
      const { error } = await supabase
        .from('businesses')
        .update(dados)
        .eq('id', user?.business_id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business'] })
      toast.success('Configurações salvas com sucesso!')
    },
    onError: () => {
      toast.error('Erro ao salvar configurações')
    },
  })

  const onSubmit = (dados: NegocioForm) => {
    mutation.mutate(dados)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600" />
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Informações Básicas */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Store className="w-5 h-5 text-primary-600" />
          <h2 className="text-lg font-semibold">Informações Básicas</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="nome">Nome do Negócio</Label>
            <Input
              id="nome"
              defaultValue={business?.nome}
              {...register('nome')}
            />
            {errors.nome && (
              <p className="text-sm text-status-error mt-1">
                {errors.nome.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="telefone">Telefone</Label>
            <Input
              id="telefone"
              defaultValue={business?.telefone}
              {...register('telefone')}
            />
            {errors.telefone && (
              <p className="text-sm text-status-error mt-1">
                {errors.telefone.message}
              </p>
            )}
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              defaultValue={business?.email}
              {...register('email')}
            />
            {errors.email && (
              <p className="text-sm text-status-error mt-1">
                {errors.email.message}
              </p>
            )}
          </div>
        </div>
      </Card>

      {/* Endereço */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <MapPin className="w-5 h-5 text-primary-600" />
          <h2 className="text-lg font-semibold">Endereço</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Label htmlFor="endereco">Endereço</Label>
            <Input
              id="endereco"
              defaultValue={business?.endereco}
              {...register('endereco')}
            />
            {errors.endereco && (
              <p className="text-sm text-status-error mt-1">
                {errors.endereco.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="cidade">Cidade</Label>
            <Input
              id="cidade"
              defaultValue={business?.cidade}
              {...register('cidade')}
            />
            {errors.cidade && (
              <p className="text-sm text-status-error mt-1">
                {errors.cidade.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="estado">Estado</Label>
              <Input
                id="estado"
                defaultValue={business?.estado}
                {...register('estado')}
              />
              {errors.estado && (
                <p className="text-sm text-status-error mt-1">
                  {errors.estado.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="cep">CEP</Label>
              <Input
                id="cep"
                defaultValue={business?.cep}
                {...register('cep')}
              />
              {errors.cep && (
                <p className="text-sm text-status-error mt-1">
                  {errors.cep.message}
                </p>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Horário de Funcionamento */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Clock className="w-5 h-5 text-primary-600" />
          <h2 className="text-lg font-semibold">Horário de Funcionamento</h2>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="horario_inicio">Horário de Abertura</Label>
              <Input
                id="horario_inicio"
                type="time"
                defaultValue={business?.horario_inicio}
                {...register('horario_inicio')}
              />
              {errors.horario_inicio && (
                <p className="text-sm text-status-error mt-1">
                  {errors.horario_inicio.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="horario_fim">Horário de Fechamento</Label>
              <Input
                id="horario_fim"
                type="time"
                defaultValue={business?.horario_fim}
                {...register('horario_fim')}
              />
              {errors.horario_fim && (
                <p className="text-sm text-status-error mt-1">
                  {errors.horario_fim.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <Label>Dias de Funcionamento</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
              {diasSemana.map((dia) => (
                <label
                  key={dia.id}
                  className="flex items-center gap-2 p-2 rounded border border-border-default hover:bg-background-hover cursor-pointer"
                >
                  <input
                    type="checkbox"
                    value={dia.id}
                    defaultChecked={business?.dias_funcionamento?.includes(dia.id)}
                    {...register('dias_funcionamento')}
                    className="rounded border-border-default text-primary-600 focus:ring-primary-600"
                  />
                  <span>{dia.nome}</span>
                </label>
              ))}
            </div>
            {errors.dias_funcionamento && (
              <p className="text-sm text-status-error mt-1">
                {errors.dias_funcionamento.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="intervalo_agendamento">
              Intervalo entre Agendamentos (minutos)
            </Label>
            <Input
              id="intervalo_agendamento"
              type="number"
              min="15"
              step="15"
              defaultValue={business?.intervalo_agendamento}
              {...register('intervalo_agendamento', { valueAsNumber: true })}
            />
            {errors.intervalo_agendamento && (
              <p className="text-sm text-status-error mt-1">
                {errors.intervalo_agendamento.message}
              </p>
            )}
          </div>
        </div>
      </Card>

      {/* Logo */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <ImageIcon className="w-5 h-5 text-primary-600" />
          <h2 className="text-lg font-semibold">Logo</h2>
        </div>

        <div className="flex items-center gap-4">
          {business?.logo_url ? (
            <img
              src={business.logo_url}
              alt="Logo"
              className="w-24 h-24 rounded-lg object-cover"
            />
          ) : (
            <div className="w-24 h-24 rounded-lg bg-background-hover flex items-center justify-center">
              <ImageIcon className="w-8 h-8 text-text-secondary" />
            </div>
          )}

          <Button type="button" variant="outline">
            Alterar Logo
          </Button>
        </div>
      </Card>

      {/* Botão Salvar */}
      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={mutation.isPending}
          className="gap-2"
        >
          {mutation.isPending ? (
            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white" />
          ) : (
            'Salvar Configurações'
          )}
        </Button>
      </div>
    </form>
  )
}
