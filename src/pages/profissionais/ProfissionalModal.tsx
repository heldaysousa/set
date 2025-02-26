import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { Professional } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'

const profissionalSchema = z.object({
  name: z.string().min(3, 'O nome deve ter no mínimo 3 caracteres'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(10, 'Telefone inválido'),
  commission_rate: z.number().min(0, 'A comissão deve ser maior ou igual a 0').max(100, 'A comissão deve ser menor ou igual a 100'),
  active: z.boolean(),
})

type ProfissionalForm = z.infer<typeof profissionalSchema>

interface ProfissionalModalProps {
  profissional: Professional | null
  isOpen: boolean
  onClose: () => void
}

export const ProfissionalModal = ({
  profissional,
  isOpen,
  onClose,
}: ProfissionalModalProps) => {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  // Verificação de segurança para business_id
  if (!user?.business_id) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg text-gray-500">Carregando...</p>
      </div>
    )
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfissionalForm>({
    defaultValues: profissional ? {
      name: profissional.name,
      email: profissional.email,
      phone: profissional.phone || '',
      active: profissional.active || false,
      commission_rate: profissional.commission_rate || 0
    } : undefined
  })

  const handleSalvar = async (dados: ProfissionalForm) => {
    try {
      const { error } = await supabase
        .from('professionals')
        .insert([{
          ...dados,
          business_id: user.business_id,
          specialties: [],
          schedule: {}
        }])

      if (error) throw error

      toast.success('Profissional salvo com sucesso!')
      queryClient.invalidateQueries({ queryKey: ['profissionais'] })
      onClose()
    } catch (error) {
      console.error(error)
      toast.error('Erro ao salvar profissional')
    }
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-6 w-full max-w-md">
          <div className="flex justify-between items-center mb-6">
            <Dialog.Title className="text-lg font-semibold">
              {profissional ? 'Editar Profissional' : 'Novo Profissional'}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="text-gray-400 hover:text-gray-500">
                <X className="w-5 h-5" />
              </button>
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit(handleSalvar)} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">Nome</label>
              <Input
                {...register('name')}
                error={errors.name?.message}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">Email</label>
              <Input
                {...register('email')}
                type="email"
                error={errors.email?.message}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="phone" className="text-sm font-medium">Telefone</label>
              <Input
                {...register('phone')}
                error={errors.phone?.message}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="commission_rate" className="text-sm font-medium">Comissão (%)</label>
              <Input
                {...register('commission_rate')}
                type="number"
                step="0.01"
                error={errors.commission_rate?.message}
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                {...register('active')}
              />
              <label className="text-sm font-medium text-gray-700">
                Profissional ativo
              </label>
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="ghost" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit">
                {profissional ? 'Salvar' : 'Criar'}
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
