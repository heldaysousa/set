import React, { useState } from 'react'
import { format, startOfMonth, endOfMonth, subMonths, addMonths } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  Plus,
  ArrowUp,
  ArrowDown,
  Filter,
  Target
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useFinanceiroStore } from '@/stores/financeiroStore'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { NovaTransacaoModal } from './NovaTransacaoModal'
import { ConfiguracaoMetas } from './ConfiguracaoMetas'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatCurrency } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export function Financeiro() {
  const { user } = useAuthStore()
  const [mesAtual, setMesAtual] = useState(new Date())
  const [modalAberto, setModalAberto] = useState(false)
  const [tipoTransacao, setTipoTransacao] = useState<'receita' | 'despesa'>('receita')
  const [modalMetasAberto, setModalMetasAberto] = useState(false)
  const [filtros, setFiltros] = useState({
    periodo: 'mes',
    categoria: 'todas',
    status: 'todos'
  })

  const {
    transacoes,
    resumoMensal,
    metaReceita,
    categorias,
    isLoading,
    fetchTransacoes,
  } = useFinanceiroStore()

  // Buscar transações do mês
  React.useEffect(() => {
    if (user?.business_id) {
      fetchTransacoes({
        businessId: user.business_id,
        dataInicio: startOfMonth(mesAtual),
        dataFim: endOfMonth(mesAtual),
        categoria: filtros.categoria === 'todas' ? undefined : filtros.categoria,
        status: filtros.status === 'todos' ? undefined : filtros.status,
      })
    }
  }, [user?.business_id, mesAtual, filtros])

  const abrirModal = (tipo: 'receita' | 'despesa') => {
    setTipoTransacao(tipo)
    setModalAberto(true)
  }

  const mudarMes = (direcao: 'anterior' | 'proximo') => {
    setMesAtual(atual =>
      direcao === 'anterior'
        ? subMonths(atual, 1)
        : addMonths(atual, 1)
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Financeiro</h1>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => abrirModal('despesa')}
          >
            <Plus className="w-4 h-4" />
            Nova Despesa
          </Button>
          <Button
            className="gap-2"
            onClick={() => abrirModal('receita')}
          >
            <Plus className="w-4 h-4" />
            Nova Receita
          </Button>
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => setModalMetasAberto(true)}
          >
            <Target className="w-4 h-4" />
            Configurar Metas
          </Button>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-emerald-500/10 p-3">
              <ArrowUp className="h-6 w-6 text-emerald-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Receitas</p>
              <h2 className="text-2xl font-bold">{formatCurrency(resumoMensal.totalReceitas)}</h2>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-red-500/10 p-3">
              <ArrowDown className="h-6 w-6 text-red-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Despesas</p>
              <h2 className="text-2xl font-bold">{formatCurrency(resumoMensal.totalDespesas)}</h2>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-blue-500/10 p-3">
              <Target className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Meta Mensal</p>
              <h2 className="text-2xl font-bold">{formatCurrency(metaReceita.valorMeta)}</h2>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-purple-500/10 p-3">
              <Target className="h-6 w-6 text-purple-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Saldo</p>
              <h2 className="text-2xl font-bold">{formatCurrency(resumoMensal.saldo)}</h2>
            </div>
          </div>
        </Card>
      </div>

      {/* Filtros e Lista de Transações */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Transações</h3>
          <div className="flex items-center gap-3">
            <Select
              value={filtros.periodo}
              onValueChange={(value) => setFiltros(prev => ({ ...prev, periodo: value }))}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hoje">Hoje</SelectItem>
                <SelectItem value="semana">Esta semana</SelectItem>
                <SelectItem value="mes">Este mês</SelectItem>
                <SelectItem value="ano">Este ano</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filtros.categoria}
              onValueChange={(value) => setFiltros(prev => ({ ...prev, categoria: value }))}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas as categorias</SelectItem>
                {categorias.receitas.map(categoria => (
                  <SelectItem key={categoria.id} value={categoria.id}>
                    {categoria.nome}
                  </SelectItem>
                ))}
                {categorias.despesas.map(categoria => (
                  <SelectItem key={categoria.id} value={categoria.id}>
                    {categoria.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filtros.status}
              onValueChange={(value) => setFiltros(prev => ({ ...prev, status: value }))}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os status</SelectItem>
                <SelectItem value="confirmado">Confirmado</SelectItem>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="agendado">Agendado</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="icon">
              <Filter className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Lista de Transações */}
      <div className="space-y-4">
        {transacoes.map((transacao) => (
          <Card key={transacao.id} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={cn(
                  "rounded-full p-2",
                  transacao.tipo === 'receita' 
                    ? "bg-emerald-500/10" 
                    : "bg-red-500/10"
                )}>
                  {transacao.tipo === 'receita' ? (
                    <ArrowUp className={cn(
                      "h-4 w-4",
                      "text-emerald-500"
                    )} />
                  ) : (
                    <ArrowDown className={cn(
                      "h-4 w-4",
                      "text-red-500"
                    )} />
                  )}
                </div>
                <div>
                  <p className="font-medium">{transacao.descricao}</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(transacao.data), "dd 'de' MMMM", { locale: ptBR })}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className={cn(
                  "font-medium",
                  transacao.tipo === 'receita' 
                    ? "text-emerald-500" 
                    : "text-red-500"
                )}>
                  {transacao.tipo === 'receita' ? '+' : '-'} 
                  {formatCurrency(transacao.valor)}
                </p>
                <Badge 
                  variant={
                    transacao.status === 'confirmado' 
                      ? 'default' 
                      : transacao.status === 'pendente'
                      ? 'secondary'
                      : 'outline'
                  }
                >
                  {transacao.status}
                </Badge>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <NovaTransacaoModal
        isOpen={modalAberto}
        onClose={() => setModalAberto(false)}
        tipo={tipoTransacao}
      />

      <ConfiguracaoMetas
        isOpen={modalMetasAberto}
        onClose={() => setModalMetasAberto(false)}
      />
    </div>
  )
}
