import React, { useState, useMemo, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from '@/components/ui/select'
import { useFinanceiroStore } from '@/stores/financeiroStore'
import { toast } from 'sonner'
import { formatCurrency } from '@/lib/utils'
import { Categoria } from '@/types/financeiro'
import { Calendar, DollarSign, FileText, CreditCard, CheckCircle } from 'lucide-react'

interface NovaTransacaoModalProps {
  isOpen: boolean
  onClose: () => void
  tipo: 'receita' | 'despesa'
}

const INITIAL_FORM_DATA = {
  descricao: '',
  valor: '',
  categoria: '',
  data: new Date().toISOString().split('T')[0],
  formaPagamento: '',
  status: 'confirmado',
  observacoes: ''
}

export function NovaTransacaoModal({ isOpen, onClose, tipo }: NovaTransacaoModalProps) {
  const { categorias, formasPagamento, adicionarTransacao } = useFinanceiroStore()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState(INITIAL_FORM_DATA)

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setFormData(INITIAL_FORM_DATA)
    }
  }, [isOpen])

  const categoriasAgrupadas = useMemo(() => {
    const categoriasDisponiveis = tipo === 'receita' ? categorias.receitas : categorias.despesas
    return categoriasDisponiveis.reduce((acc, categoria) => {
      if (!acc[categoria.grupo]) {
        acc[categoria.grupo] = []
      }
      acc[categoria.grupo].push(categoria)
      return acc
    }, {} as Record<string, Categoria[]>)
  }, [tipo, categorias])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validação mais detalhada
    const errors = []
    if (!formData.descricao.trim()) errors.push('Descrição')
    if (!formData.valor || Number(formData.valor) <= 0) errors.push('Valor')
    if (!formData.categoria) errors.push('Categoria')
    if (!formData.formaPagamento) errors.push('Forma de pagamento')
    if (!formData.data) errors.push('Data')

    if (errors.length > 0) {
      toast.error(`Preencha os campos obrigatórios: ${errors.join(', ')}`)
      return
    }

    setLoading(true)
    try {
      await adicionarTransacao({
        tipo,
        descricao: formData.descricao.trim(),
        valor: Number(formData.valor),
        categoria: formData.categoria,
        data: formData.data,
        formaPagamento: formData.formaPagamento,
        status: formData.status as 'confirmado' | 'pendente' | 'agendado',
        observacoes: formData.observacoes.trim()
      })

      toast.success(`${tipo === 'receita' ? 'Receita' : 'Despesa'} adicionada com sucesso!`)
      onClose()
    } catch (error) {
      toast.error('Erro ao adicionar transação. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const getCategoriaInfo = (categoriaId: string) => {
    const lista = tipo === 'receita' ? categorias.receitas : categorias.despesas
    return lista.find(cat => cat.id === categoriaId)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <div className={`p-2 rounded-lg ${tipo === 'receita' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
              <DollarSign className="w-5 h-5" />
            </div>
            {tipo === 'receita' ? 'Nova Receita' : 'Nova Despesa'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="descricao" className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-muted-foreground" />
              {tipo === 'receita' ? 'Descrição da Receita' : 'Descrição da Despesa'}*
            </Label>
            <Input
              id="descricao"
              required
              value={formData.descricao}
              onChange={e => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
              placeholder={tipo === 'receita' ? 'Ex: Pagamento de Serviço' : 'Ex: Aluguel'}
              className="focus:ring-2 focus:ring-offset-2"
            />
          </div>

          {/* Valor e Data */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="valor" className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-muted-foreground" />
                Valor*
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  R$
                </span>
                <Input
                  id="valor"
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  className="pl-8 focus:ring-2 focus:ring-offset-2"
                  value={formData.valor}
                  onChange={e => setFormData(prev => ({ ...prev, valor: e.target.value }))}
                  placeholder="0,00"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="data" className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                Data do {tipo === 'receita' ? 'Recebimento' : 'Pagamento'}*
              </Label>
              <Input
                id="data"
                type="date"
                required
                className="focus:ring-2 focus:ring-offset-2"
                value={formData.data}
                onChange={e => setFormData(prev => ({ ...prev, data: e.target.value }))}
              />
            </div>
          </div>

          {/* Categoria e Forma de Pagamento */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="categoria" className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-muted-foreground" />
                Categoria*
              </Label>
              <Select
                value={formData.categoria}
                onValueChange={value => setFormData(prev => ({ ...prev, categoria: value }))}
              >
                <SelectTrigger className="w-full focus:ring-2 focus:ring-offset-2">
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {Object.entries(categoriasAgrupadas).map(([grupo, categorias]) => (
                    <SelectGroup key={grupo}>
                      <SelectLabel className="font-semibold px-2 py-1.5 text-sm bg-muted/50">
                        {grupo}
                      </SelectLabel>
                      {categorias.map(categoria => (
                        <SelectItem 
                          key={categoria.id} 
                          value={categoria.id}
                          className="flex items-center gap-2 pl-6"
                        >
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: categoria.cor }} 
                          />
                          {categoria.nome}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="formaPagamento" className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-muted-foreground" />
                Forma de {tipo === 'receita' ? 'Recebimento' : 'Pagamento'}*
              </Label>
              <Select
                value={formData.formaPagamento}
                onValueChange={value => setFormData(prev => ({ ...prev, formaPagamento: value }))}
              >
                <SelectTrigger className="w-full focus:ring-2 focus:ring-offset-2">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {formasPagamento.filter(f => f.ativo).map(forma => (
                    <SelectItem key={forma.id} value={forma.id}>
                      {forma.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status" className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-muted-foreground" />
              Status*
            </Label>
            <Select
              value={formData.status}
              onValueChange={value => setFormData(prev => ({ ...prev, status: value }))}
            >
              <SelectTrigger className="w-full focus:ring-2 focus:ring-offset-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="confirmado">
                  {tipo === 'receita' ? 'Recebido' : 'Pago'}
                </SelectItem>
                <SelectItem value="pendente">
                  {tipo === 'receita' ? 'A Receber' : 'A Pagar'}
                </SelectItem>
                <SelectItem value="agendado">Agendado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Observações */}
          <div className="space-y-2">
            <Label htmlFor="observacoes" className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-muted-foreground" />
              Observações
            </Label>
            <textarea
              id="observacoes"
              className="w-full min-h-[100px] p-3 rounded-md border bg-background resize-none focus:outline-none focus:ring-2 focus:ring-offset-2"
              value={formData.observacoes}
              onChange={e => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
              placeholder="Observações adicionais..."
            />
          </div>

          {/* Preview da Transação */}
          {(formData.valor || formData.categoria) && (
            <div className={`p-4 rounded-lg border ${
              tipo === 'receita' ? 'bg-emerald-500/5 border-emerald-500/10' : 'bg-rose-500/5 border-rose-500/10'
            }`}>
              <h4 className="font-medium mb-2">Resumo da {tipo === 'receita' ? 'Receita' : 'Despesa'}</h4>
              <div className="space-y-1 text-sm">
                {formData.valor && (
                  <p>Valor: <span className="font-medium">{formatCurrency(Number(formData.valor))}</span></p>
                )}
                {formData.categoria && (
                  <p>Categoria: <span className="font-medium">{getCategoriaInfo(formData.categoria)?.nome}</span></p>
                )}
                {formData.data && (
                  <p>Data: <span className="font-medium">{new Date(formData.data).toLocaleDateString('pt-BR')}</span></p>
                )}
              </div>
            </div>
          )}

          {/* Botões */}
          <div className="flex justify-end gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="focus:ring-2 focus:ring-offset-2"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className={`focus:ring-2 focus:ring-offset-2 ${
                tipo === 'receita' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-rose-500 hover:bg-rose-600'
              }`}
            >
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
