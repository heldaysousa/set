import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ClientForm } from '../components/ClientForm'
import { ClientHistory } from '../components/ClientHistory'
import { Client, ClientWithHistory } from '@/types/client'
import { useToast } from '@/components/ui/use-toast'
import { useAuthStore } from '@/stores/authStore'
import { Skeleton } from '@/components/ui/skeleton'

// Dados mockados para desenvolvimento
const mockClients: ClientWithHistory[] = [
  {
    id: '1',
    name: 'Maria Silva',
    email: 'maria.silva@email.com',
    phone: '11999887766',
    birthDate: '1990-05-15',
    notes: 'Cliente regular, prefere atendimento pela manhã',
    createdAt: '2024-01-01',
    updatedAt: '2024-03-10',
    history: [
      {
        id: '1',
        clientId: '1',
        serviceId: '1',
        professionalId: '1',
        date: '2024-03-10',
        time: '09:00',
        duration: 60,
        value: 150,
        serviceName: 'Corte e Escova',
        professionalName: 'João',
        status: 'concluido',
        paymentMethod: 'dinheiro',
        createdAt: '2024-03-10',
        updatedAt: '2024-03-10'
      }
    ],
    totalSpent: 150,
    lastVisit: '2024-03-10',
    visitCount: 1
  },
  {
    id: '2',
    name: 'João Santos',
    email: 'joao.santos@email.com',
    phone: '11988776655',
    birthDate: '1985-08-22',
    notes: 'Alérgico a alguns produtos, verificar ficha',
    createdAt: '2024-01-15',
    updatedAt: '2024-03-08',
    history: [
      {
        id: '2',
        clientId: '2',
        serviceId: '2',
        professionalId: '2',
        date: '2024-03-08',
        time: '14:00',
        duration: 30,
        value: 80,
        serviceName: 'Barba',
        professionalName: 'Pedro',
        status: 'concluido',
        paymentMethod: 'pix',
        createdAt: '2024-03-08',
        updatedAt: '2024-03-08'
      }
    ],
    totalSpent: 80,
    lastVisit: '2024-03-08',
    visitCount: 1
  }
]

export function ClientsPage() {
  const { toast } = useToast()
  const { business } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [showNewClient, setShowNewClient] = useState(false)
  const [selectedClient, setSelectedClient] = useState<ClientWithHistory | null>(null)
  const [clients, setClients] = useState<ClientWithHistory[]>([])
  const [searchTerm, setSearchTerm] = useState('')

  const loadClients = async () => {
    try {
      // Simulando um delay de carregamento
      await new Promise(resolve => setTimeout(resolve, 1000))
      setClients(mockClients)
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os clientes',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadClients()
  }, [business?.id])

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone?.includes(searchTerm)
  )

  if (showNewClient) {
    return (
      <div className="container py-6">
        <ClientForm
          onSuccess={() => {
            setShowNewClient(false)
            loadClients()
          }}
          onCancel={() => setShowNewClient(false)}
        />
      </div>
    )
  }

  if (selectedClient) {
    return (
      <div className="container py-6">
        <Button
          variant="outline"
          className="mb-4"
          onClick={() => setSelectedClient(null)}
        >
          Voltar
        </Button>

        <ClientForm
          initialData={selectedClient}
          onSuccess={() => {
            setSelectedClient(null)
            loadClients()
          }}
          onCancel={() => setSelectedClient(null)}
        />

        <ClientHistory
          clientId={selectedClient.id}
          history={selectedClient.history}
          onUpdate={loadClients}
        />
      </div>
    )
  }

  return (
    <div className="container py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Clientes</h1>
        <Button onClick={() => setShowNewClient(true)}>Novo Cliente</Button>
      </div>

      <div className="mb-6">
        <Input
          placeholder="Buscar por nome, email ou telefone..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-[250px]" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-4 w-[150px]" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : filteredClients.length === 0 ? (
          <p className="col-span-full text-center text-muted-foreground">
            Nenhum cliente encontrado
          </p>
        ) : (
          filteredClients.map(client => (
            <Card
              key={client.id}
              className="cursor-pointer hover:bg-accent/50 transition-colors"
              onClick={() => setSelectedClient(client)}
            >
              <CardHeader>
                <CardTitle className="text-xl">{client.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    {client.phone}
                    {client.email && ` • ${client.email}`}
                  </p>
                  <div className="flex justify-between text-sm">
                    <span>Total gasto:</span>
                    <span className="font-medium">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      }).format(client.totalSpent)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Última visita:</span>
                    <span className="font-medium">
                      {client.lastVisit
                        ? new Date(client.lastVisit).toLocaleDateString()
                        : 'Nunca'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Total de visitas:</span>
                    <span className="font-medium">{client.visitCount}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
