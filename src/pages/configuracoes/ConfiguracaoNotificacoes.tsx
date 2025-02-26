import React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Bell, MessageSquare, Mail } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Switch } from "@/components/ui/switch"
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

const notificacoesSchema = z.object({
  notificar_agendamento: z.boolean(),
  notificar_cancelamento: z.boolean(),
  notificar_lembrete: z.boolean(),
  notificar_aniversario: z.boolean(),
  notificar_meta_atingida: z.boolean(),
  notificar_conta_vencendo: z.boolean(),
  email_habilitado: z.boolean(),
  whatsapp_habilitado: z.boolean(),
  push_habilitado: z.boolean(),
  lembrete_antecedencia: z.number().min(1).max(72),
})

type NotificacoesForm = z.infer<typeof notificacoesSchema>

export const ConfiguracaoNotificacoes = () => {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<NotificacoesForm>({
    resolver: zodResolver(notificacoesSchema),
  })

  // Buscar configurações
  const { data: config, isLoading } = useQuery({
    queryKey: ['notification_settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notification_settings')
        .select('*')
        .eq('business_id', user?.business_id)
        .single()

      if (error) throw error
      return data
    },
  })

  // Atualizar configurações
  const mutation = useMutation({
    mutationFn: async (dados: NotificacoesForm) => {
      const { error } = await supabase
        .from('notification_settings')
        .update(dados)
        .eq('business_id', user?.business_id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification_settings'] })
      toast.success('Configurações salvas com sucesso!')
    },
    onError: () => {
      toast.error('Erro ao salvar configurações')
    },
  })

  const onSubmit = (dados: NotificacoesForm) => {
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
      {/* Eventos */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Bell className="w-5 h-5 text-primary-600" />
          <h2 className="text-lg font-semibold">Eventos para Notificar</h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="notificar_agendamento">
              Novos Agendamentos
              <p className="text-sm text-text-secondary">
                Notificar quando um novo agendamento for realizado
              </p>
            </Label>
            <Switch
              id="notificar_agendamento"
              defaultChecked={config?.notificar_agendamento}
              onCheckedChange={(checked) =>
                setValue('notificar_agendamento', checked)
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="notificar_cancelamento">
              Cancelamentos
              <p className="text-sm text-text-secondary">
                Notificar quando um agendamento for cancelado
              </p>
            </Label>
            <Switch
              id="notificar_cancelamento"
              defaultChecked={config?.notificar_cancelamento}
              onCheckedChange={(checked) =>
                setValue('notificar_cancelamento', checked)
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="notificar_lembrete">
              Lembretes
              <p className="text-sm text-text-secondary">
                Enviar lembretes de agendamentos
              </p>
            </Label>
            <Switch
              id="notificar_lembrete"
              defaultChecked={config?.notificar_lembrete}
              onCheckedChange={(checked) => setValue('notificar_lembrete', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="notificar_aniversario">
              Aniversários
              <p className="text-sm text-text-secondary">
                Notificar aniversários de clientes
              </p>
            </Label>
            <Switch
              id="notificar_aniversario"
              defaultChecked={config?.notificar_aniversario}
              onCheckedChange={(checked) =>
                setValue('notificar_aniversario', checked)
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="notificar_meta_atingida">
              Metas Atingidas
              <p className="text-sm text-text-secondary">
                Notificar quando uma meta financeira for atingida
              </p>
            </Label>
            <Switch
              id="notificar_meta_atingida"
              defaultChecked={config?.notificar_meta_atingida}
              onCheckedChange={(checked) =>
                setValue('notificar_meta_atingida', checked)
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="notificar_conta_vencendo">
              Contas a Pagar
              <p className="text-sm text-text-secondary">
                Notificar sobre contas próximas do vencimento
              </p>
            </Label>
            <Switch
              id="notificar_conta_vencendo"
              defaultChecked={config?.notificar_conta_vencendo}
              onCheckedChange={(checked) =>
                setValue('notificar_conta_vencendo', checked)
              }
            />
          </div>
        </div>
      </Card>

      {/* Canais */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <MessageSquare className="w-5 h-5 text-primary-600" />
          <h2 className="text-lg font-semibold">Canais de Notificação</h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="email_habilitado">
              Email
              <p className="text-sm text-text-secondary">
                Enviar notificações por email
              </p>
            </Label>
            <Switch
              id="email_habilitado"
              defaultChecked={config?.email_habilitado}
              onCheckedChange={(checked) => setValue('email_habilitado', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="whatsapp_habilitado">
              WhatsApp
              <p className="text-sm text-text-secondary">
                Enviar notificações por WhatsApp
              </p>
            </Label>
            <Switch
              id="whatsapp_habilitado"
              defaultChecked={config?.whatsapp_habilitado}
              onCheckedChange={(checked) =>
                setValue('whatsapp_habilitado', checked)
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="push_habilitado">
              Notificações Push
              <p className="text-sm text-text-secondary">
                Enviar notificações push no navegador
              </p>
            </Label>
            <Switch
              id="push_habilitado"
              defaultChecked={config?.push_habilitado}
              onCheckedChange={(checked) => setValue('push_habilitado', checked)}
            />
          </div>
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
