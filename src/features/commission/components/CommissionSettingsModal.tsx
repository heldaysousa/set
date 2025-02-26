import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CommissionSettings } from '@/types/commission'

interface CommissionSettingsModalProps {
  isOpen: boolean
  onClose: () => void
  settings: CommissionSettings
  onSave: (settings: CommissionSettings) => void
}

export function CommissionSettingsModal({
  isOpen,
  onClose,
  settings,
  onSave
}: CommissionSettingsModalProps) {
  const [formData, setFormData] = React.useState(settings)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Configurações de Comissão</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="defaultPercentage">Percentual Padrão (%)</Label>
            <Input
              id="defaultPercentage"
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={formData.defaultPercentage}
              onChange={e => setFormData(prev => ({
                ...prev,
                defaultPercentage: Number(e.target.value)
              }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="calculationPeriod">Período de Cálculo</Label>
            <Select
              value={formData.calculationPeriod}
              onValueChange={value => setFormData(prev => ({
                ...prev,
                calculationPeriod: value as CommissionSettings['calculationPeriod']
              }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Diário</SelectItem>
                <SelectItem value="weekly">Semanal</SelectItem>
                <SelectItem value="biweekly">Quinzenal</SelectItem>
                <SelectItem value="monthly">Mensal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="paymentDay">Dia do Pagamento</Label>
            <Input
              id="paymentDay"
              type="number"
              min="1"
              max="31"
              value={formData.paymentDay}
              onChange={e => setFormData(prev => ({
                ...prev,
                paymentDay: Number(e.target.value)
              }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="minimumValue">Valor Mínimo (R$)</Label>
              <Input
                id="minimumValue"
                type="number"
                min="0"
                step="0.01"
                value={formData.minimumValue || ''}
                onChange={e => setFormData(prev => ({
                  ...prev,
                  minimumValue: e.target.value ? Number(e.target.value) : undefined
                }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maximumValue">Valor Máximo (R$)</Label>
              <Input
                id="maximumValue"
                type="number"
                min="0"
                step="0.01"
                value={formData.maximumValue || ''}
                onChange={e => setFormData(prev => ({
                  ...prev,
                  maximumValue: e.target.value ? Number(e.target.value) : undefined
                }))}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              Salvar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
