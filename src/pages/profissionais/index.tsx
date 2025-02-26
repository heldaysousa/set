import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Trash2, Mail, Phone } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { Professional } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { ProfissionalModal } from './ProfissionalModal'

export const Profissionais = () => {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [profissionalSelecionado, setProfissionalSelecionado] = useState<Professional | null>(null)
  const [modalAberto, setModalAberto] = useState(false)

  // Buscar profissionais
  const { data: profissionais, isLoading } = useQuery({
    queryKey: ['profissionais'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('professionals')
        .select('*')
        .eq('business_id', user?.business_id)
        .order('name')

      if (error) throw error
      return data as Professional[]
    },
  })

  // Deletar profissional
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('professionals')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profissionais'] })
      toast.success('Profissional excluído com sucesso!')
    },
    onError: () => {
      toast.error('Erro ao excluir profissional.')
    },
  })

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este profissional?')) {
      deleteMutation.mutate(id)
    }
  }

  const handleEdit = (profissional: Professional) => {
    setProfissionalSelecionado(profissional)
    setModalAberto(true)
  }

  const handleAdd = () => {
    setProfissionalSelecionado(null)
    setModalAberto(true)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="page-title">Profissionais</h1>
        <Button onClick={handleAdd}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Profissional
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {profissionais?.map((profissional) => (
          <div
            key={profissional.id}
            className="card flex flex-col justify-between"
          >
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {profissional.name}
              </h3>
              <div className="mt-4 space-y-2">
                <div className="flex items-center text-sm text-gray-500">
                  <Mail className="w-4 h-4 mr-2" />
                  {profissional.email}
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Phone className="w-4 h-4 mr-2" />
                  {profissional.phone}
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Comissão:</span>
                  <span className="font-medium">
                    {profissional.commission_rate}%
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Status:</span>
                  <span className={`font-medium ${profissional.active ? 'text-green-600' : 'text-red-600'}`}>
                    {profissional.active ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 flex justify-end space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEdit(profissional)}
              >
                <Pencil className="w-4 h-4 mr-2" />
                Editar
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(profissional.id)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Excluir
              </Button>
            </div>
          </div>
        ))}
      </div>

      <ProfissionalModal
        profissional={profissionalSelecionado}
        isOpen={modalAberto}
        onClose={() => setModalAberto(false)}
      />
    </div>
  )
}
