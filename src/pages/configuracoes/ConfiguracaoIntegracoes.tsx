import React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { MessageSquare, Bot, Smartphone, Plug } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

const integracoesSchema = z.object({
  whatsapp_habilitado: z.boolean(),
  whatsapp_numero: z.string().optional(),
  whatsapp_token: z.string().optional(),
  chatbot_habilitado: z.boolean(),
  chatbot_nome: z.string().optional(),
  chatbot_personalidade: z.string().optional(),
  chatbot_respostas_padrao: z.boolean(),
  chatbot_aprendizado: z.boolean(),
  notificacoes_push_habilitado: z.boolean(),
  notificacoes_push_key: z.string().optional(),
})

type IntegracoesForm = z.infer<typeof integracoesSchema>

export const ConfiguracaoIntegracoes = () => {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<IntegracoesForm>({
    resolver: zodResolver(integracoesSchema),
  })

  // Buscar configurações
  const { data: config, isLoading } = useQuery({
    queryKey: ['integration_settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('integration_settings')
        .select('*')
        .eq('business_id', user?.business_id)
        .single()

      if (error) throw error
      return data
    },
  })

  // Atualizar configurações
  const mutation = useMutation({
    mutationFn: async (dados: IntegracoesForm) => {
      const { error } = await supabase
        .from('integration_settings')
        .update(dados)
        .eq('business_id', user?.business_id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integration_settings'] })
      toast.success('Configurações salvas com sucesso!')
    },
    onError: () => {
      toast.error('Erro ao salvar configurações')
    },
  })

  const onSubmit = (dados: IntegracoesForm) => {
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
      {/* WhatsApp */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <MessageSquare className="w-5 h-5 text-primary-600" />
          <h2 className="text-lg font-semibold">WhatsApp</h2>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Label htmlFor="whatsapp_habilitado">
              Integração com WhatsApp
              <p className="text-sm text-text-secondary">
                Habilitar envio de mensagens e notificações via WhatsApp
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

          {watch('whatsapp_habilitado') && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="whatsapp_numero">Número do WhatsApp</Label>
                <Input
                  id="whatsapp_numero"
                  placeholder="Ex: +5511999999999"
                  defaultValue={config?.whatsapp_numero}
                  {...register('whatsapp_numero')}
                />
                {errors.whatsapp_numero && (
                  <p className="text-sm text-status-error mt-1">
                    {errors.whatsapp_numero.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="whatsapp_token">Token de Acesso</Label>
                <Input
                  id="whatsapp_token"
                  type="password"
                  placeholder="Token da API do WhatsApp"
                  defaultValue={config?.whatsapp_token}
                  {...register('whatsapp_token')}
                />
                {errors.whatsapp_token && (
                  <p className="text-sm text-status-error mt-1">
                    {errors.whatsapp_token.message}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Chatbot */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Bot className="w-5 h-5 text-primary-600" />
          <h2 className="text-lg font-semibold">Chatbot</h2>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Label htmlFor="chatbot_habilitado">
              Chatbot Inteligente
              <p className="text-sm text-text-secondary">
                Habilitar assistente virtual para atendimento automático
              </p>
            </Label>
            <Switch
              id="chatbot_habilitado"
              defaultChecked={config?.chatbot_habilitado}
              onCheckedChange={(checked) => setValue('chatbot_habilitado', checked)}
            />
          </div>

          {watch('chatbot_habilitado') && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="chatbot_nome">Nome do Chatbot</Label>
                  <Input
                    id="chatbot_nome"
                    placeholder="Ex: Assistente Virtual"
                    defaultValue={config?.chatbot_nome}
                    {...register('chatbot_nome')}
                  />
                </div>

                <div>
                  <Label htmlFor="chatbot_personalidade">
                    Personalidade do Chatbot
                  </Label>
                  <Input
                    id="chatbot_personalidade"
                    placeholder="Ex: Amigável e prestativo"
                    defaultValue={config?.chatbot_personalidade}
                    {...register('chatbot_personalidade')}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="chatbot_respostas_padrao">
                    Respostas Padrão
                    <p className="text-sm text-text-secondary">
                      Usar respostas pré-definidas para perguntas comuns
                    </p>
                  </Label>
                  <Switch
                    id="chatbot_respostas_padrao"
                    defaultChecked={config?.chatbot_respostas_padrao}
                    onCheckedChange={(checked) =>
                      setValue('chatbot_respostas_padrao', checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="chatbot_aprendizado">
                    Aprendizado Contínuo
                    <p className="text-sm text-text-secondary">
                      Permitir que o chatbot aprenda com as interações
                    </p>
                  </Label>
                  <Switch
                    id="chatbot_aprendizado"
                    defaultChecked={config?.chatbot_aprendizado}
                    onCheckedChange={(checked) =>
                      setValue('chatbot_aprendizado', checked)
                    }
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </Card>

      {/* Notificações Push */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Smartphone className="w-5 h-5 text-primary-600" />
          <h2 className="text-lg font-semibold">Notificações Push</h2>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Label htmlFor="notificacoes_push_habilitado">
              Notificações Push
              <p className="text-sm text-text-secondary">
                Habilitar notificações push para dispositivos móveis
              </p>
            </Label>
            <Switch
              id="notificacoes_push_habilitado"
              defaultChecked={config?.notificacoes_push_habilitado}
              onCheckedChange={(checked) =>
                setValue('notificacoes_push_habilitado', checked)
              }
            />
          </div>

          {watch('notificacoes_push_habilitado') && (
            <div>
              <Label htmlFor="notificacoes_push_key">Chave de API</Label>
              <Input
                id="notificacoes_push_key"
                type="password"
                placeholder="Chave da API de notificações push"
                defaultValue={config?.notificacoes_push_key}
                {...register('notificacoes_push_key')}
              />
              {errors.notificacoes_push_key && (
                <p className="text-sm text-status-error mt-1">
                  {errors.notificacoes_push_key.message}
                </p>
              )}
            </div>
          )}
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
