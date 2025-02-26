import React from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useClientHistory } from '@/hooks/useClientHistory'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, DollarSign, User, Scissors, CreditCard } from 'lucide-react'

interface ClientHistoryProps {
  clientId: string
}

export function ClientHistory({ clientId }: ClientHistoryProps) {
  const { history, stats, topServices, isLoading } = useClientHistory(clientId)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const getPaymentMethodBadge = (method: string) => {
    const colors = {
      credit: 'bg-green-500',
      debit: 'bg-blue-500',
      cash: 'bg-yellow-500',
      pix: 'bg-purple-500',
      transfer: 'bg-orange-500'
    }

    return (
      <Badge className={colors[method as keyof typeof colors]}>
        {method.toUpperCase()}
      </Badge>
    )
  }

  const getPaymentStatusBadge = (status: string) => {
    const colors = {
      paid: 'bg-green-500',
      pending: 'bg-yellow-500',
      cancelled: 'bg-red-500'
    }

    return (
      <Badge className={colors[status as keyof typeof colors]}>
        {status === 'paid' ? 'PAGO' : status === 'pending' ? 'PENDENTE' : 'CANCELADO'}
      </Badge>
    )
  }

  return (
    <Tabs defaultValue="history" className="w-full">
      <TabsList>
        <TabsTrigger value="history">Histórico</TabsTrigger>
        <TabsTrigger value="stats">Estatísticas</TabsTrigger>
        <TabsTrigger value="services">Serviços Frequentes</TabsTrigger>
      </TabsList>

      {/* Histórico de Atendimentos */}
      <TabsContent value="history">
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Atendimentos</CardTitle>
            <CardDescription>
              Todos os atendimentos realizados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Serviço</TableHead>
                  <TableHead>Profissional</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Pagamento</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history?.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {format(new Date(item.date), 'dd/MM/yyyy')}
                        </span>
                        <span className="text-sm text-muted-foreground flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          {item.time}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium flex items-center gap-2">
                          <Scissors className="w-4 h-4" />
                          {item.service_name}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {item.procedure}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        {item.professional_id}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="flex items-center gap-2 font-medium">
                        <DollarSign className="w-4 h-4" />
                        {formatCurrency(item.value)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4" />
                        {getPaymentMethodBadge(item.payment_method)}
                      </span>
                    </TableCell>
                    <TableCell>
                      {getPaymentStatusBadge(item.payment_status)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Estatísticas */}
      <TabsContent value="stats">
        <Card>
          <CardHeader>
            <CardTitle>Estatísticas do Cliente</CardTitle>
            <CardDescription>
              Resumo dos atendimentos e gastos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Total de Atendimentos</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{stats?.total_appointments}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Total Gasto</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{formatCurrency(stats?.total_spent || 0)}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Ticket Médio</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{formatCurrency(stats?.avg_ticket || 0)}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Serviço Favorito</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xl font-medium">{stats?.favorite_service}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Profissional Favorito</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xl font-medium">{stats?.favorite_professional}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Última Visita</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xl font-medium">
                    {stats?.last_visit ? format(new Date(stats.last_visit), 'dd/MM/yyyy', { locale: ptBR }) : 'N/A'}
                  </p>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Serviços Frequentes */}
      <TabsContent value="services">
        <Card>
          <CardHeader>
            <CardTitle>Serviços Mais Frequentes</CardTitle>
            <CardDescription>
              Top 5 serviços mais utilizados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Serviço</TableHead>
                  <TableHead>Quantidade</TableHead>
                  <TableHead>Total Gasto</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topServices?.map((service) => (
                  <TableRow key={service.service_name}>
                    <TableCell className="font-medium">{service.service_name}</TableCell>
                    <TableCell>{service.count}x</TableCell>
                    <TableCell>{formatCurrency(service.total_spent)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
