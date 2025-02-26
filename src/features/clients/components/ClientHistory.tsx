import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ClientHistory as IClientHistory } from '@/types/client'
import { useToast } from '@/components/ui/use-toast'
import { useAuthStore } from '@/stores/authStore'
import { supabase } from '@/lib/supabase'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Badge } from '@/components/ui/badge'
import { Clock, Calendar, DollarSign, User, Scissors, CreditCard, FileText } from 'lucide-react'

interface ClientHistoryProps {
  clientId: string
  history: IClientHistory[]
  onUpdate: () => void
}

export function ClientHistory({ clientId, history, onUpdate }: ClientHistoryProps) {
  const { toast } = useToast()
  const { business } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [showAddService, setShowAddService] = useState(false)
  const [services, setServices] = useState<any[]>([])
  const [professionals, setProfessionals] = useState<any[]>([])
  const [formData, setFormData] = useState({
    serviceId: '',
    professionalId: '',
    date: new Date().toISOString().split('T')[0],
    time: '09:00',
    duration: 30,
    value: '',
    serviceDetails: '',
    status: 'concluido',
    paymentMethod: 'dinheiro',
    notes: ''
  })

  const loadDependencies = async () => {
    const [servicesRes, professionalsRes] = await Promise.all([
      supabase.from('services').select('*').eq('businessId', business?.id),
      supabase.from('professionals').select('*').eq('businessId', business?.id)
    ])

    if (servicesRes.data) setServices(servicesRes.data)
    if (professionalsRes.data) setProfessionals(professionalsRes.data)
  }

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const selectedService = services.find(s => s.id === formData.serviceId)
      const selectedProfessional = professionals.find(p => p.id === formData.professionalId)

      const { error } = await supabase
        .from('client_history')
        .insert({
          clientId,
          serviceId: formData.serviceId,
          professionalId: formData.professionalId,
          date: formData.date,
          time: formData.time,
          duration: formData.duration,
          value: Number(formData.value),
          serviceDetails: formData.serviceDetails,
          status: formData.status,
          paymentMethod: formData.paymentMethod,
          notes: formData.notes,
          serviceName: selectedService?.name,
          professionalName: selectedProfessional?.name,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })

      if (error) throw error

      toast({
        title: 'Serviço adicionado',
        description: 'O serviço foi adicionado ao histórico do cliente'
      })

      setShowAddService(false)
      setFormData({
        serviceId: '',
        professionalId: '',
        date: new Date().toISOString().split('T')[0],
        time: '09:00',
        duration: 30,
        value: '',
        serviceDetails: '',
        status: 'concluido',
        paymentMethod: 'dinheiro',
        notes: ''
      })
      onUpdate()
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível adicionar o serviço',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const statusColors = {
    concluido: 'bg-green-500',
    cancelado: 'bg-red-500',
    agendado: 'bg-blue-500'
  }

  return (
    <Card className="mt-4">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Histórico de Atendimentos</CardTitle>
        <Button onClick={() => {
          setShowAddService(true)
          loadDependencies()
        }}>
          Adicionar Serviço
        </Button>
      </CardHeader>
      <CardContent>
        {showAddService ? (
          <form onSubmit={handleAddService} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Serviço*</Label>
                <Select
                  required
                  value={formData.serviceId}
                  onValueChange={value => {
                    const service = services.find(s => s.id === value)
                    setFormData(prev => ({
                      ...prev,
                      serviceId: value,
                      value: service?.price?.toString() || '',
                      duration: service?.duration || 30
                    }))
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um serviço" />
                  </SelectTrigger>
                  <SelectContent>
                    {services.map(service => (
                      <SelectItem key={service.id} value={service.id}>
                        {service.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Profissional*</Label>
                <Select
                  required
                  value={formData.professionalId}
                  onValueChange={value => setFormData(prev => ({ ...prev, professionalId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um profissional" />
                  </SelectTrigger>
                  <SelectContent>
                    {professionals.map(professional => (
                      <SelectItem key={professional.id} value={professional.id}>
                        {professional.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Data*</Label>
                <Input
                  type="date"
                  required
                  value={formData.date}
                  onChange={e => setFormData(prev => ({ ...prev, date: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Horário*</Label>
                <Input
                  type="time"
                  required
                  value={formData.time}
                  onChange={e => setFormData(prev => ({ ...prev, time: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Duração (min)*</Label>
                <Input
                  type="number"
                  required
                  value={formData.duration}
                  onChange={e => setFormData(prev => ({ ...prev, duration: Number(e.target.value) }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Valor*</Label>
                <Input
                  type="number"
                  required
                  value={formData.value}
                  onChange={e => setFormData(prev => ({ ...prev, value: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Status*</Label>
                <Select
                  required
                  value={formData.status}
                  onValueChange={value => setFormData(prev => ({ ...prev, status: value as any }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="concluido">Concluído</SelectItem>
                    <SelectItem value="cancelado">Cancelado</SelectItem>
                    <SelectItem value="agendado">Agendado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Forma de Pagamento</Label>
                <Select
                  value={formData.paymentMethod}
                  onValueChange={value => setFormData(prev => ({ ...prev, paymentMethod: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dinheiro">Dinheiro</SelectItem>
                    <SelectItem value="pix">PIX</SelectItem>
                    <SelectItem value="credito">Cartão de Crédito</SelectItem>
                    <SelectItem value="debito">Cartão de Débito</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Detalhes do Serviço</Label>
              <Input
                value={formData.serviceDetails}
                onChange={e => setFormData(prev => ({ ...prev, serviceDetails: e.target.value }))}
                placeholder="Ex: Corte degradê, barba tradicional, etc."
              />
            </div>

            <div className="space-y-2">
              <Label>Observações</Label>
              <textarea
                className="w-full min-h-[100px] p-2 rounded-md border"
                value={formData.notes}
                onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Observações adicionais sobre o atendimento..."
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowAddService(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Salvando...' : 'Adicionar'}
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            {history.length === 0 ? (
              <p className="text-center text-muted-foreground">
                Nenhum atendimento registrado
              </p>
            ) : (
              <div className="space-y-4">
                {history.map(item => (
                  <Card key={item.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <Badge className={statusColors[item.status]}>
                            {item.status === 'concluido' ? 'Concluído' :
                             item.status === 'cancelado' ? 'Cancelado' : 'Agendado'}
                          </Badge>
                          {item.paymentMethod && (
                            <Badge variant="outline">
                              {item.paymentMethod === 'dinheiro' ? 'Dinheiro' :
                               item.paymentMethod === 'pix' ? 'PIX' :
                               item.paymentMethod === 'credito' ? 'Crédito' : 'Débito'}
                            </Badge>
                          )}
                        </div>
                        <p className="font-medium text-lg">
                          {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL'
                          }).format(item.value)}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            <span>{format(new Date(item.date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="w-4 h-4" />
                            <span>{item.time} ({item.duration} min)</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Scissors className="w-4 h-4" />
                            <span className="font-medium">{item.serviceName}</span>
                          </div>
                          {item.serviceDetails && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <FileText className="w-4 h-4" />
                              <span>{item.serviceDetails}</span>
                            </div>
                          )}
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            <span className="font-medium">{item.professionalName}</span>
                          </div>
                          {item.notes && (
                            <p className="text-sm text-muted-foreground">
                              {item.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
