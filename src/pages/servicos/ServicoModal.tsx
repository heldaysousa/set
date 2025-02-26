import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Service } from '@/types/supabase'
import { Badge } from '@/components/ui/badge'

const CATEGORIAS = [
  { value: 'cabelo', label: 'Cabelo', color: 'blue' },
  { value: 'barba', label: 'Barba', color: 'amber' },
  { value: 'manicure', label: 'Manicure', color: 'pink' },
  { value: 'pedicure', label: 'Pedicure', color: 'purple' },
  { value: 'estetica', label: 'Estética', color: 'green' },
  { value: 'outros', label: 'Outros', color: 'gray' }
] as const

interface ServicoModalProps {
  isOpen: boolean
  onClose: () => void
  servico: Service | null
  onSave: (servico: Partial<Service>) => void
}

export function ServicoModal({ isOpen, onClose, servico, onSave }: ServicoModalProps) {
  const [formData, setFormData] = useState<Partial<Service>>({
    name: '',
    description: '',
    price: 0,
    duration: 30,
    category: 'outros'
  })

  useEffect(() => {
    if (servico) {
      setFormData({
        name: servico.name,
        description: servico.description || '',
        price: servico.price,
        duration: servico.duration,
        category: servico.category
      })
    } else {
      setFormData({
        name: '',
        description: '',
        price: 0,
        duration: 30,
        category: 'outros'
      })
    }
  }, [servico])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {servico ? 'Editar Serviço' : 'Novo Serviço'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome*</Label>
            <Input
              id="name"
              required
              value={formData.name}
              onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Ex: Corte Masculino"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <textarea
              id="description"
              className="w-full min-h-[100px] p-2 rounded-md border bg-background resize-none focus:outline-none focus:ring-2 focus:ring-ring"
              value={formData.description}
              onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descreva os detalhes do serviço..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Preço (R$)*</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                required
                value={formData.price}
                onChange={e => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
                placeholder="0,00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duração (min)*</Label>
              <Input
                id="duration"
                type="number"
                min="15"
                step="15"
                required
                value={formData.duration}
                onChange={e => setFormData(prev => ({ ...prev, duration: Number(e.target.value) }))}
                placeholder="30"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Categoria*</Label>
            <Select
              value={formData.category}
              onValueChange={value => setFormData(prev => ({ ...prev, category: value }))}
            >
              <SelectTrigger className="w-full bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIAS.map(categoria => (
                  <SelectItem 
                    key={categoria.value} 
                    value={categoria.value}
                    className="flex items-center gap-2"
                  >
                    <div className="flex items-center gap-2">
                      <Badge variant="default" className={`bg-${categoria.color}-500/10 text-${categoria.color}-500 hover:bg-${categoria.color}-500/20`}>
                        {categoria.label}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              {servico ? 'Atualizar' : 'Criar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
