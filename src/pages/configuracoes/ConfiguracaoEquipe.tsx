import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Calendar } from '@/components/ui/calendar'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus, Users, DollarSign, Calendar as CalendarIcon } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { supabase } from '@/lib/supabase'
import { formatarMoeda } from '@/utils/formatters'

interface Professional {
  id: string
  name: string
  email: string
  phone: string
  commission_rate: number
  active: boolean
}

interface ComissaoPagamento {
  id: string
  professional_id: string
  valor: number
  data_fechamento: string
  data_pagamento: string
  status: 'pendente' | 'pago'
}

export function ConfiguracaoEquipe() {
  const { user } = useAuthStore()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState('profissionais')
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Buscar profissionais
  const { data: profissionais, isLoading: isLoadingProfissionais } = useQuery({
    queryKey: ['profissionais'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('professionals')
        .select('*')
        .eq('business_id', user?.businessId)
        .order('name')

      if (error) throw error
      return data as Professional[]
    }
  })

  // Buscar comissões
  const { data: comissoes, isLoading: isLoadingComissoes } = useQuery({
    queryKey: ['comissoes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('comissoes_pagamentos')
        .select('*')
        .eq('business_id', user?.businessId)
        .order('data_fechamento', { ascending: false })

      if (error) throw error
      return data as ComissaoPagamento[]
    }
  })

  // Calcular comissões do período
  const calcularComissoes = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.rpc('calcular_comissoes', {
        data_fechamento: selectedDate.toISOString(),
        business_id: user?.businessId
      })

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comissoes'] })
      setIsModalOpen(false)
    }
  })

  // Pagar comissão
  const pagarComissao = useMutation({
    mutationFn: async (comissaoId: string) => {
      const { error } = await supabase
        .from('comissoes_pagamentos')
        .update({
          status: 'pago',
          data_pagamento: new Date().toISOString()
        })
        .eq('id', comissaoId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comissoes'] })
    }
  })

  if (isLoadingProfissionais || isLoadingComissoes) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="profissionais">
            <Users className="w-4 h-4 mr-2" />
            Profissionais
          </TabsTrigger>
          <TabsTrigger value="comissoes">
            <DollarSign className="w-4 h-4 mr-2" />
            Comissões
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profissionais">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Profissionais</CardTitle>
                <Button onClick={() => setIsModalOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Profissional
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>Comissão</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {profissionais?.map((profissional) => (
                    <TableRow key={profissional.id}>
                      <TableCell>{profissional.name}</TableCell>
                      <TableCell>{profissional.email}</TableCell>
                      <TableCell>{profissional.phone}</TableCell>
                      <TableCell>{profissional.commission_rate}%</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          profissional.active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {profissional.active ? 'Ativo' : 'Inativo'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          Editar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comissoes">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Comissões</CardTitle>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <CalendarIcon className="w-4 h-4 mr-2" />
                      Calcular Comissões
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Calcular Comissões</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Data de Fechamento</label>
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={(date) => date && setSelectedDate(date)}
                          className="rounded-md border"
                        />
                      </div>
                      <Button 
                        onClick={() => calcularComissoes.mutate()}
                        disabled={calcularComissoes.isPending}
                      >
                        {calcularComissoes.isPending ? 'Calculando...' : 'Calcular'}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Profissional</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Data Fechamento</TableHead>
                    <TableHead>Data Pagamento</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {comissoes?.map((comissao) => {
                    const profissional = profissionais?.find(p => p.id === comissao.professional_id)
                    return (
                      <TableRow key={comissao.id}>
                        <TableCell>{profissional?.name}</TableCell>
                        <TableCell>{formatarMoeda(comissao.valor)}</TableCell>
                        <TableCell>
                          {format(new Date(comissao.data_fechamento), 'dd/MM/yyyy', { locale: ptBR })}
                        </TableCell>
                        <TableCell>
                          {comissao.data_pagamento 
                            ? format(new Date(comissao.data_pagamento), 'dd/MM/yyyy', { locale: ptBR })
                            : '-'
                          }
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            comissao.status === 'pago'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {comissao.status === 'pago' ? 'Pago' : 'Pendente'}
                          </span>
                        </TableCell>
                        <TableCell>
                          {comissao.status === 'pendente' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => pagarComissao.mutate(comissao.id)}
                              disabled={pagarComissao.isPending}
                            >
                              Pagar
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
