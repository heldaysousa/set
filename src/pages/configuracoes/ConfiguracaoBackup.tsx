import React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Shield, Download, Upload, History } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'

const backupSchema = z.object({
  backup_automatico: z.boolean(),
  frequencia_backup: z.enum(['diario', 'semanal', 'mensal']),
  manter_backups: z.number().min(1).max(12),
  backup_dados: z.boolean(),
  backup_arquivos: z.boolean(),
  backup_configuracoes: z.boolean(),
  criptografar_backup: z.boolean(),
})

type BackupForm = z.infer<typeof backupSchema>

const frequencias = [
  { value: 'diario', label: 'Diário' },
  { value: 'semanal', label: 'Semanal' },
  { value: 'mensal', label: 'Mensal' },
]

export const ConfiguracaoBackup = () => {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<BackupForm>({
    resolver: zodResolver(backupSchema),
  })

  // Buscar configurações
  const { data: config, isLoading } = useQuery({
    queryKey: ['backup_settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('backup_settings')
        .select('*')
        .eq('business_id', user?.business_id)
        .single()

      if (error) throw error
      return data
    },
  })

  // Atualizar configurações
  const mutation = useMutation({
    mutationFn: async (dados: BackupForm) => {
      const { error } = await supabase
        .from('backup_settings')
        .update(dados)
        .eq('business_id', user?.business_id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['backup_settings'] })
      toast.success('Configurações salvas com sucesso!')
    },
    onError: () => {
      toast.error('Erro ao salvar configurações')
    },
  })

  // Realizar backup manual
  const backupMutation = useMutation({
    mutationFn: async () => {
      // Aqui seria implementada a lógica de backup
      await new Promise((resolve) => setTimeout(resolve, 2000))
    },
    onSuccess: () => {
      toast.success('Backup realizado com sucesso!')
    },
    onError: () => {
      toast.error('Erro ao realizar backup')
    },
  })

  // Restaurar backup
  const restoreMutation = useMutation({
    mutationFn: async () => {
      // Aqui seria implementada a lógica de restauração
      await new Promise((resolve) => setTimeout(resolve, 2000))
    },
    onSuccess: () => {
      toast.success('Backup restaurado com sucesso!')
    },
    onError: () => {
      toast.error('Erro ao restaurar backup')
    },
  })

  const onSubmit = (dados: BackupForm) => {
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
      {/* Backup Automático */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Shield className="w-5 h-5 text-primary-600" />
          <h2 className="text-lg font-semibold">Backup Automático</h2>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Label htmlFor="backup_automatico">
              Ativar Backup Automático
              <p className="text-sm text-text-secondary">
                Realizar backups automáticos periodicamente
              </p>
            </Label>
            <Switch
              id="backup_automatico"
              defaultChecked={config?.backup_automatico}
              onCheckedChange={(checked) => setValue('backup_automatico', checked)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="frequencia_backup">Frequência do Backup</Label>
              <Select
                value={watch('frequencia_backup')}
                onValueChange={(value: any) =>
                  setValue('frequencia_backup', value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {frequencias.map((freq) => (
                    <SelectItem key={freq.value} value={freq.value}>
                      {freq.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="manter_backups">
                Manter Backups (meses)
              </Label>
              <Select
                value={String(watch('manter_backups'))}
                onValueChange={(value: any) =>
                  setValue('manter_backups', Number(value))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((num) => (
                    <SelectItem key={num} value={String(num)}>
                      {num} {num === 1 ? 'mês' : 'meses'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </Card>

      {/* Configurações de Backup */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <History className="w-5 h-5 text-primary-600" />
          <h2 className="text-lg font-semibold">Configurações de Backup</h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="backup_dados">
              Dados do Sistema
              <p className="text-sm text-text-secondary">
                Incluir dados de clientes, agendamentos e financeiro
              </p>
            </Label>
            <Switch
              id="backup_dados"
              defaultChecked={config?.backup_dados}
              onCheckedChange={(checked) => setValue('backup_dados', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="backup_arquivos">
              Arquivos e Mídia
              <p className="text-sm text-text-secondary">
                Incluir imagens, documentos e outros arquivos
              </p>
            </Label>
            <Switch
              id="backup_arquivos"
              defaultChecked={config?.backup_arquivos}
              onCheckedChange={(checked) => setValue('backup_arquivos', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="backup_configuracoes">
              Configurações do Sistema
              <p className="text-sm text-text-secondary">
                Incluir preferências, permissões e configurações
              </p>
            </Label>
            <Switch
              id="backup_configuracoes"
              defaultChecked={config?.backup_configuracoes}
              onCheckedChange={(checked) =>
                setValue('backup_configuracoes', checked)
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="criptografar_backup">
              Criptografar Backup
              <p className="text-sm text-text-secondary">
                Adicionar camada extra de segurança aos backups
              </p>
            </Label>
            <Switch
              id="criptografar_backup"
              defaultChecked={config?.criptografar_backup}
              onCheckedChange={(checked) =>
                setValue('criptografar_backup', checked)
              }
            />
          </div>
        </div>
      </Card>

      {/* Ações de Backup */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Download className="w-5 h-5 text-primary-600" />
          <h2 className="text-lg font-semibold">Ações de Backup</h2>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <Button
            type="button"
            variant="outline"
            className="flex-1 gap-2"
            onClick={() => backupMutation.mutate()}
            disabled={backupMutation.isPending}
          >
            {backupMutation.isPending ? (
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-primary-600" />
            ) : (
              <>
                <Download className="w-4 h-4" />
                Realizar Backup Manual
              </>
            )}
          </Button>

          <Button
            type="button"
            variant="outline"
            className="flex-1 gap-2"
            onClick={() => restoreMutation.mutate()}
            disabled={restoreMutation.isPending}
          >
            {restoreMutation.isPending ? (
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-primary-600" />
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Restaurar Backup
              </>
            )}
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
