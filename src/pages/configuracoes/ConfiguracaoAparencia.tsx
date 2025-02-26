import React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Palette, Moon, Sun, Layout } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Switch } from "@/components/ui/switch"
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { toast } from 'sonner'

const aparenciaSchema = z.object({
  tema: z.enum(['light', 'dark', 'system']),
  cor_primaria: z.string(),
  modo_compacto: z.boolean(),
  animacoes: z.boolean(),
  fonte: z.enum(['inter', 'roboto', 'poppins']),
  tamanho_fonte: z.enum(['pequeno', 'medio', 'grande']),
  layout: z.enum(['padrao', 'compacto', 'confortavel']),
})

type AparenciaForm = z.infer<typeof aparenciaSchema>

const cores = [
  { value: '#0066FF', label: 'Azul' },
  { value: '#00875F', label: 'Verde' },
  { value: '#7C3AED', label: 'Roxo' },
  { value: '#E11D48', label: 'Vermelho' },
  { value: '#F59E0B', label: 'Laranja' },
  { value: '#06B6D4', label: 'Ciano' },
]

const fontes = [
  { value: 'inter', label: 'Inter' },
  { value: 'roboto', label: 'Roboto' },
  { value: 'poppins', label: 'Poppins' },
]

const tamanhosFonte = [
  { value: 'pequeno', label: 'Pequeno' },
  { value: 'medio', label: 'Médio' },
  { value: 'grande', label: 'Grande' },
]

const layouts = [
  { value: 'padrao', label: 'Padrão' },
  { value: 'compacto', label: 'Compacto' },
  { value: 'confortavel', label: 'Confortável' },
]

export const ConfiguracaoAparencia = () => {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<AparenciaForm>({
    resolver: zodResolver(aparenciaSchema),
  })

  // Buscar configurações
  const { data: config, isLoading } = useQuery({
    queryKey: ['appearance_settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('appearance_settings')
        .select('*')
        .eq('business_id', user?.business_id)
        .single()

      if (error) throw error
      return data
    },
  })

  // Atualizar configurações
  const mutation = useMutation({
    mutationFn: async (dados: AparenciaForm) => {
      const { error } = await supabase
        .from('appearance_settings')
        .update(dados)
        .eq('business_id', user?.business_id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appearance_settings'] })
      toast.success('Configurações salvas com sucesso!')
    },
    onError: () => {
      toast.error('Erro ao salvar configurações')
    },
  })

  const onSubmit = (dados: AparenciaForm) => {
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
      {/* Tema */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Palette className="w-5 h-5 text-primary-600" />
          <h2 className="text-lg font-semibold">Tema</h2>
        </div>

        <div className="space-y-6">
          <div>
            <Label>Modo de Cor</Label>
            <RadioGroup
              defaultValue={config?.tema}
              onValueChange={(value: any) => setValue('tema', value)}
              className="grid grid-cols-3 gap-4 mt-2"
            >
              <Label
                htmlFor="light"
                className="flex flex-col items-center gap-2 p-4 rounded-lg border border-border-default cursor-pointer hover:bg-background-hover [&:has(:checked)]:border-primary-600"
              >
                <RadioGroupItem value="light" id="light" className="sr-only" />
                <Sun className="w-6 h-6" />
                <span>Claro</span>
              </Label>

              <Label
                htmlFor="dark"
                className="flex flex-col items-center gap-2 p-4 rounded-lg border border-border-default cursor-pointer hover:bg-background-hover [&:has(:checked)]:border-primary-600"
              >
                <RadioGroupItem value="dark" id="dark" className="sr-only" />
                <Moon className="w-6 h-6" />
                <span>Escuro</span>
              </Label>

              <Label
                htmlFor="system"
                className="flex flex-col items-center gap-2 p-4 rounded-lg border border-border-default cursor-pointer hover:bg-background-hover [&:has(:checked)]:border-primary-600"
              >
                <RadioGroupItem value="system" id="system" className="sr-only" />
                <div className="flex">
                  <Sun className="w-6 h-6" />
                  <Moon className="w-6 h-6" />
                </div>
                <span>Sistema</span>
              </Label>
            </RadioGroup>
          </div>

          <div>
            <Label>Cor Primária</Label>
            <RadioGroup
              defaultValue={config?.cor_primaria}
              onValueChange={(value: any) => setValue('cor_primaria', value)}
              className="grid grid-cols-3 md:grid-cols-6 gap-4 mt-2"
            >
              {cores.map((cor) => (
                <Label
                  key={cor.value}
                  htmlFor={cor.value}
                  className="flex flex-col items-center gap-2 p-4 rounded-lg border border-border-default cursor-pointer hover:bg-background-hover [&:has(:checked)]:border-primary-600"
                >
                  <RadioGroupItem
                    value={cor.value}
                    id={cor.value}
                    className="sr-only"
                  />
                  <div
                    className="w-6 h-6 rounded-full"
                    style={{ backgroundColor: cor.value }}
                  />
                  <span>{cor.label}</span>
                </Label>
              ))}
            </RadioGroup>
          </div>
        </div>
      </Card>

      {/* Interface */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Layout className="w-5 h-5 text-primary-600" />
          <h2 className="text-lg font-semibold">Interface</h2>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="fonte">Fonte</Label>
              <Select
                value={watch('fonte')}
                onValueChange={(value: any) => setValue('fonte', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {fontes.map((fonte) => (
                    <SelectItem key={fonte.value} value={fonte.value}>
                      {fonte.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="tamanho_fonte">Tamanho da Fonte</Label>
              <Select
                value={watch('tamanho_fonte')}
                onValueChange={(value: any) => setValue('tamanho_fonte', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {tamanhosFonte.map((tamanho) => (
                    <SelectItem key={tamanho.value} value={tamanho.value}>
                      {tamanho.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="layout">Layout</Label>
            <RadioGroup
              defaultValue={config?.layout}
              onValueChange={(value: any) => setValue('layout', value)}
              className="grid grid-cols-3 gap-4 mt-2"
            >
              {layouts.map((layout) => (
                <Label
                  key={layout.value}
                  htmlFor={layout.value}
                  className="flex flex-col items-center gap-2 p-4 rounded-lg border border-border-default cursor-pointer hover:bg-background-hover [&:has(:checked)]:border-primary-600"
                >
                  <RadioGroupItem
                    value={layout.value}
                    id={layout.value}
                    className="sr-only"
                  />
                  <Layout className="w-6 h-6" />
                  <span>{layout.label}</span>
                </Label>
              ))}
            </RadioGroup>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="modo_compacto">
                Modo Compacto
                <p className="text-sm text-text-secondary">
                  Reduzir espaçamento e tamanho dos elementos
                </p>
              </Label>
              <Switch
                id="modo_compacto"
                defaultChecked={config?.modo_compacto}
                onCheckedChange={(checked) => setValue('modo_compacto', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="animacoes">
                Animações
                <p className="text-sm text-text-secondary">
                  Habilitar animações na interface
                </p>
              </Label>
              <Switch
                id="animacoes"
                defaultChecked={config?.animacoes}
                onCheckedChange={(checked) => setValue('animacoes', checked)}
              />
            </div>
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
