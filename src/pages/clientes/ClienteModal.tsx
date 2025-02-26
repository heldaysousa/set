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
import { Client } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'

const clienteSchema = z.object({
  name: z.string().min(3, 'O nome deve ter no mínimo 3 caracteres'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  phone: z.string().min(10, 'Telefone inválido'),
  notes: z.string().optional(),
})

type ClienteForm = z.infer<typeof clienteSchema>

interface ClienteModalProps {
  cliente: Client | null
  isOpen: boolean
  onClose: () => void
}

export const ClienteModal = ({
  cliente,
  isOpen,
  onClose,
}: ClienteModalProps) => {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ClienteForm>({
    resolver: zodResolver(clienteSchema),
    defaultValues: cliente || {
      name: '',
      email: '',
      phone: '',
      notes: '',
    },
  })

  // Criar/Atualizar cliente
  const mutation = useMutation({
    mutationFn: async (data: ClienteForm) => {
      if (cliente) {
        // Atualizar
        const { error } = await supabase
          .from('clients')
          .update({
            ...data,
            updated_at: new Date().toISOString(),
          })
          .eq('id', cliente.id)

        if (error) throw error
      } else {
        // Criar
        const { error } = await supabase.from('clients').insert([
          {
            ...data,
            business_id: user?.business_id,
          },
        ])

        if (error) throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] })
      toast.success(
        cliente
          ? 'Cliente atualizado com sucesso!'
          : 'Cliente criado com sucesso!'
      )
      handleClose()
    },
    onError: () => {
      toast.error(
        cliente
          ? 'Erro ao atualizar cliente.'
          : 'Erro ao criar cliente.'
      )
    },
  })

  const handleClose = () => {
    reset()
    onClose()
  }

  const onSubmit = async (data: ClienteForm) => {
    await mutation.mutateAsync(data)
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={handleClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-6 w-full max-w-md">
          <div className="flex justify-between items-center mb-6">
            <Dialog.Title className="text-lg font-semibold">
              {cliente ? 'Editar Cliente' : 'Novo Cliente'}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="text-gray-400 hover:text-gray-500">
                <X className="w-5 h-5" />
              </button>
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Nome"
              error={errors.name?.message}
              {...register('name')}
            />

            <Input
              label="Email"
              type="email"
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              label="Telefone"
              error={errors.phone?.message}
              {...register('phone')}
            />

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Observações
              </label>
              <textarea
                className={`
                  w-full
                  px-3
                  py-2
                  border
                  border-gray-300
                  rounded-md
                  shadow-sm
                  focus:outline-none
                  focus:ring-2
                  focus:ring-primary-500
                  focus:border-primary-500
                  ${errors.notes ? 'border-red-500' : ''}
                `}
                rows={3}
                {...register('notes')}
              />
              {errors.notes && (
                <span className="text-sm text-red-500">
                  {errors.notes.message}
                </span>
              )}
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="ghost" onClick={handleClose}>
                Cancelar
              </Button>
              <Button type="submit" loading={isSubmitting}>
                {cliente ? 'Salvar' : 'Criar'}
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
