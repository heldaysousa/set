import React, { useState } from 'react'
import { Plus, Pencil, Trash2, Clock, DollarSign, Users, Search, Filter } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Service } from '@/types/supabase'
import { useAuthStore } from '@/stores/authStore'
import { ServicoModal } from './ServicoModal'
import { debounce } from '@/lib/utils'
import { formatCurrency } from '@/lib/utils'
import { mockServices } from '@/mocks/servicesData'
import { Badge } from '@/components/ui/badge'

const CATEGORIAS = [
  { value: 'todas', label: 'Todas', color: 'default' },
  { value: 'cabelo', label: 'Cabelo', color: 'blue' },
  { value: 'barba', label: 'Barba', color: 'amber' },
  { value: 'manicure', label: 'Manicure', color: 'pink' },
  { value: 'pedicure', label: 'Pedicure', color: 'purple' },
  { value: 'estetica', label: 'Estética', color: 'green' },
  { value: 'outros', label: 'Outros', color: 'gray' }
] as const

export function Servicos() {
  const { user } = useAuthStore()
  const [servicoSelecionado, setServicoSelecionado] = useState<Service | null>(null)
  const [modalAberto, setModalAberto] = useState(false)
  const [busca, setBusca] = useState('')
  const [filtroCategoria, setFiltroCategoria] = useState('todas')
  const [loading, setLoading] = useState(true)
  const [servicos, setServicos] = useState<Service[]>([])

  // Carregar serviços
  React.useEffect(() => {
    const loadServicos = async () => {
      try {
        // Simulando delay de carregamento
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Filtrar serviços baseado na busca e categoria
        let servicosFiltrados = [...mockServices]
        
        if (busca) {
          servicosFiltrados = servicosFiltrados.filter(servico => 
            servico.name.toLowerCase().includes(busca.toLowerCase()) ||
            servico.description?.toLowerCase().includes(busca.toLowerCase())
          )
        }
        
        if (filtroCategoria !== 'todas') {
          servicosFiltrados = servicosFiltrados.filter(servico => 
            servico.category === filtroCategoria
          )
        }
        
        setServicos(servicosFiltrados)
      } catch (error) {
        console.error('Erro ao carregar serviços:', error)
        toast.error('Não foi possível carregar os serviços')
      } finally {
        setLoading(false)
      }
    }

    loadServicos()
  }, [busca, filtroCategoria])

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este serviço?')) {
      try {
        // Simulando delay de exclusão
        await new Promise(resolve => setTimeout(resolve, 500))
        
        setServicos(prev => prev.filter(servico => servico.id !== id))
        toast.success('Serviço excluído com sucesso!')
      } catch (error) {
        console.error('Erro ao excluir serviço:', error)
        toast.error('Erro ao excluir serviço')
      }
    }
  }

  const handleEdit = (servico: Service) => {
    setServicoSelecionado(servico)
    setModalAberto(true)
  }

  const handleAdd = () => {
    setServicoSelecionado(null)
    setModalAberto(true)
  }

  const handleBuscaChange = debounce((valor: string) => {
    setBusca(valor)
  }, 300)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Serviços</h1>
        <Button onClick={handleAdd}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Serviço
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou descrição..."
              className="pl-10"
              onChange={(e) => handleBuscaChange(e.target.value)}
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
            <SelectTrigger className="min-w-[180px] bg-background">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIAS.map(categoria => (
                <SelectItem 
                  key={categoria.value} 
                  value={categoria.value}
                  className="flex items-center gap-2"
                >
                  <div className="flex items-center gap-2">
                    <Badge variant={categoria.color === 'default' ? 'secondary' : 'default'} className={
                      categoria.color !== 'default' 
                        ? `bg-${categoria.color}-500/10 text-${categoria.color}-500 hover:bg-${categoria.color}-500/20`
                        : ''
                    }>
                      {categoria.label}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Lista de Serviços */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {servicos.length === 0 ? (
          <div className="col-span-full text-center py-8 text-muted-foreground">
            Nenhum serviço encontrado
          </div>
        ) : (
          servicos.map((servico) => (
            <div
              key={servico.id}
              className="bg-card hover:bg-card/80 transition-colors rounded-lg p-4 border border-border"
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold">
                      {servico.name}
                    </h3>
                    <Badge variant="default" className={`
                      ${servico.category === 'cabelo' ? 'bg-blue-500/10 text-blue-500' : ''}
                      ${servico.category === 'barba' ? 'bg-amber-500/10 text-amber-500' : ''}
                      ${servico.category === 'manicure' ? 'bg-pink-500/10 text-pink-500' : ''}
                      ${servico.category === 'pedicure' ? 'bg-purple-500/10 text-purple-500' : ''}
                      ${servico.category === 'estetica' ? 'bg-green-500/10 text-green-500' : ''}
                      ${servico.category === 'outros' ? 'bg-gray-500/10 text-gray-500' : ''}
                    `}>
                      {CATEGORIAS.find(cat => cat.value === servico.category)?.label}
                    </Badge>
                  </div>
                  {servico.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {servico.description}
                    </p>
                  )}
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="w-4 h-4 mr-2" />
                      {servico.duration} minutos
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <DollarSign className="w-4 h-4 mr-2" />
                      {formatCurrency(servico.price)}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Users className="w-4 h-4 mr-2" />
                      {servico.professionals?.length || 0} profissionais
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(servico)}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(servico.id)}
                    className="text-destructive hover:text-destructive/90"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <ServicoModal
        isOpen={modalAberto}
        onClose={() => {
          setModalAberto(false)
          setServicoSelecionado(null)
        }}
        servico={servicoSelecionado}
        onSave={(novoServico) => {
          if (servicoSelecionado) {
            // Atualizar serviço existente
            setServicos(prev => prev.map(s => 
              s.id === servicoSelecionado.id ? { ...s, ...novoServico } : s
            ))
            toast.success('Serviço atualizado com sucesso!')
          } else {
            // Adicionar novo serviço
            const novoId = Math.random().toString(36).substr(2, 9)
            setServicos(prev => [...prev, {
              ...novoServico,
              id: novoId,
              business_id: user?.business_id || '',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            } as Service])
            toast.success('Serviço criado com sucesso!')
          }
          setModalAberto(false)
          setServicoSelecionado(null)
        }}
      />
    </div>
  )
}

export { Servicos as default }
