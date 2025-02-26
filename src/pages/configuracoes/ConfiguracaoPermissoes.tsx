import React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Lock, Plus, Trash2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from "@/components/ui/switch"
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/skeleton'

const permissoesSchema = z.object({
  usuarios: z.array(
    z.object({
      id: z.string().optional(),
      email: z.string().email('Email inválido'),
      cargo: z.enum(['admin', 'gerente', 'profissional']),
      permissoes: z.object({
        agenda_visualizar: z.boolean(),
        agenda_editar: z.boolean(),
        clientes_visualizar: z.boolean(),
        clientes_editar: z.boolean(),
        profissionais_visualizar: z.boolean(),
        profissionais_editar: z.boolean(),
        configuracoes_visualizar: z.boolean(),
        configuracoes_editar: z.boolean(),
      }),
    })
  ),
})

type PermissoesForm = z.infer<typeof permissoesSchema>

const cargos = [
  { value: 'admin', label: 'Administrador' },
  { value: 'gerente', label: 'Gerente' },
  { value: 'profissional', label: 'Profissional' },
]

export const ConfiguracaoPermissoes = () => {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<PermissoesForm>({
    resolver: zodResolver(permissoesSchema),
    defaultValues: {
      usuarios: [],
    },
  })

  // Buscar usuários e permissões
  const { data: usuarios, isLoading } = useQuery({
    queryKey: ['users_permissions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users_permissions')
        .select('*')
        .eq('business_id', user?.business_id)

      if (error) throw error
      return data
    },
  })

  // Atualizar permissões
  const mutation = useMutation({
    mutationFn: async (dados: PermissoesForm) => {
      const { error } = await supabase
        .from('users_permissions')
        .upsert(
          dados.usuarios.map((usuario) => ({
            ...usuario,
            business_id: user?.business_id,
          }))
        )

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users_permissions'] })
      toast.success('Permissões salvas com sucesso!')
    },
    onError: () => {
      toast.error('Erro ao salvar permissões')
    },
  })

  const onSubmit = (dados: PermissoesForm) => {
    mutation.mutate(dados)
  }

  const adicionarUsuario = () => {
    const usuarios = watch('usuarios') || []
    setValue('usuarios', [
      ...usuarios,
      {
        email: '',
        cargo: 'profissional',
        permissoes: {
          agenda_visualizar: true,
          agenda_editar: false,
          clientes_visualizar: true,
          clientes_editar: false,
          profissionais_visualizar: true,
          profissionais_editar: false,
          configuracoes_visualizar: false,
          configuracoes_editar: false,
        },
      },
    ])
  }

  const removerUsuario = (index: number) => {
    const usuarios = watch('usuarios') || []
    setValue(
      'usuarios',
      usuarios.filter((_, i) => i !== index)
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Array.from({ length: 4 }).map((_, j) => (
                    <div key={j} className="flex items-center justify-between">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-6 w-10" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Lock className="w-5 h-5 text-primary-600" />
          <h2 className="text-lg font-semibold">Permissões de Usuários</h2>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={adicionarUsuario}
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          Adicionar Usuário
        </Button>
      </div>

      <div className="space-y-4">
        {watch('usuarios')?.map((usuario, index) => (
          <Card key={index} className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor={`usuarios.${index}.email`}>Email</Label>
                  <Input
                    id={`usuarios.${index}.email`}
                    {...register(`usuarios.${index}.email`)}
                  />
                  {errors.usuarios?.[index]?.email && (
                    <p className="text-sm text-status-error mt-1">
                      {errors.usuarios[index]?.email?.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor={`usuarios.${index}.cargo`}>Cargo</Label>
                  <Select
                    value={usuario.cargo}
                    onValueChange={(value: any) =>
                      setValue(`usuarios.${index}.cargo`, value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {cargos.map((cargo) => (
                        <SelectItem key={cargo.value} value={cargo.value}>
                          {cargo.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                type="button"
                variant="ghost"
                onClick={() => removerUsuario(index)}
                className="ml-4"
              >
                <Trash2 className="w-4 h-4 text-status-error" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Agenda */}
              <div className="space-y-2">
                <h3 className="font-medium">Agenda</h3>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <Label htmlFor={`usuarios.${index}.permissoes.agenda_visualizar`}>
                      Visualizar
                    </Label>
                    <Switch
                      id={`usuarios.${index}.permissoes.agenda_visualizar`}
                      checked={usuario.permissoes.agenda_visualizar}
                      onCheckedChange={(checked) =>
                        setValue(
                          `usuarios.${index}.permissoes.agenda_visualizar`,
                          checked
                        )
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor={`usuarios.${index}.permissoes.agenda_editar`}>
                      Editar
                    </Label>
                    <Switch
                      id={`usuarios.${index}.permissoes.agenda_editar`}
                      checked={usuario.permissoes.agenda_editar}
                      onCheckedChange={(checked) =>
                        setValue(
                          `usuarios.${index}.permissoes.agenda_editar`,
                          checked
                        )
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Clientes */}
              <div className="space-y-2">
                <h3 className="font-medium">Clientes</h3>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <Label htmlFor={`usuarios.${index}.permissoes.clientes_visualizar`}>
                      Visualizar
                    </Label>
                    <Switch
                      id={`usuarios.${index}.permissoes.clientes_visualizar`}
                      checked={usuario.permissoes.clientes_visualizar}
                      onCheckedChange={(checked) =>
                        setValue(
                          `usuarios.${index}.permissoes.clientes_visualizar`,
                          checked
                        )
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor={`usuarios.${index}.permissoes.clientes_editar`}>
                      Editar
                    </Label>
                    <Switch
                      id={`usuarios.${index}.permissoes.clientes_editar`}
                      checked={usuario.permissoes.clientes_editar}
                      onCheckedChange={(checked) =>
                        setValue(
                          `usuarios.${index}.permissoes.clientes_editar`,
                          checked
                        )
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Profissionais */}
              <div className="space-y-2">
                <h3 className="font-medium">Profissionais</h3>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <Label htmlFor={`usuarios.${index}.permissoes.profissionais_visualizar`}>
                      Visualizar
                    </Label>
                    <Switch
                      id={`usuarios.${index}.permissoes.profissionais_visualizar`}
                      checked={usuario.permissoes.profissionais_visualizar}
                      onCheckedChange={(checked) =>
                        setValue(
                          `usuarios.${index}.permissoes.profissionais_visualizar`,
                          checked
                        )
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor={`usuarios.${index}.permissoes.profissionais_editar`}>
                      Editar
                    </Label>
                    <Switch
                      id={`usuarios.${index}.permissoes.profissionais_editar`}
                      checked={usuario.permissoes.profissionais_editar}
                      onCheckedChange={(checked) =>
                        setValue(
                          `usuarios.${index}.permissoes.profissionais_editar`,
                          checked
                        )
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Configurações */}
              <div className="space-y-2">
                <h3 className="font-medium">Configurações</h3>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <Label htmlFor={`usuarios.${index}.permissoes.configuracoes_visualizar`}>
                      Visualizar
                    </Label>
                    <Switch
                      id={`usuarios.${index}.permissoes.configuracoes_visualizar`}
                      checked={usuario.permissoes.configuracoes_visualizar}
                      onCheckedChange={(checked) =>
                        setValue(
                          `usuarios.${index}.permissoes.configuracoes_visualizar`,
                          checked
                        )
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor={`usuarios.${index}.permissoes.configuracoes_editar`}>
                      Editar
                    </Label>
                    <Switch
                      id={`usuarios.${index}.permissoes.configuracoes_editar`}
                      checked={usuario.permissoes.configuracoes_editar}
                      onCheckedChange={(checked) =>
                        setValue(
                          `usuarios.${index}.permissoes.configuracoes_editar`,
                          checked
                        )
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

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
            'Salvar Permissões'
          )}
        </Button>
      </div>
    </form>
  )
}
