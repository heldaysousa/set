import React from 'react'
import { Target, TrendingUp } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useFinanceiroStore } from '@/stores/financeiroStore'
import { metasSchema, type MetasForm } from '@/lib/schemas/financeiro'

interface ConfiguracaoMetasProps {
  isOpen: boolean
  onClose: () => void
}

export function ConfiguracaoMetas({ isOpen, onClose }: ConfiguracaoMetasProps) {
  const { metaReceita, metas, atualizarMeta } = useFinanceiroStore()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<MetasForm>({
    resolver: zodResolver(metasSchema),
    defaultValues: {
      meta_diaria: metas.diaria,
      meta_mensal: metas.mensal,
      meta_anual: metas.anual,
      objetivo_proximo: 'Comprar novo equipamento',
      valor_objetivo: 5000,
    },
  })

  const onSubmit = async (dados: MetasForm) => {
    try {
      await atualizarMeta({
        valorMeta: dados.meta_mensal,
        valorAtual: metaReceita.valorAtual,
        porcentagemAlcancada: (metaReceita.valorAtual / dados.meta_mensal) * 100
      })
      toast.success('Metas atualizadas com sucesso!')
      onClose()
    } catch (error) {
      console.error('Erro ao atualizar metas:', error)
      toast.error('Erro ao atualizar metas')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-background">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Configurar Metas Financeiras
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="meta_diaria">Meta Diária</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  R$
                </span>
                <Input
                  id="meta_diaria"
                  type="number"
                  step="0.01"
                  className="pl-8"
                  {...register('meta_diaria', { valueAsNumber: true })}
                />
              </div>
              {errors.meta_diaria && (
                <p className="text-sm text-destructive mt-1">
                  {errors.meta_diaria.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="meta_mensal">Meta Mensal</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  R$
                </span>
                <Input
                  id="meta_mensal"
                  type="number"
                  step="0.01"
                  className="pl-8"
                  {...register('meta_mensal', { valueAsNumber: true })}
                />
              </div>
              {errors.meta_mensal && (
                <p className="text-sm text-destructive mt-1">
                  {errors.meta_mensal.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="meta_anual">Meta Anual</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  R$
                </span>
                <Input
                  id="meta_anual"
                  type="number"
                  step="0.01"
                  className="pl-8"
                  {...register('meta_anual', { valueAsNumber: true })}
                />
              </div>
              {errors.meta_anual && (
                <p className="text-sm text-destructive mt-1">
                  {errors.meta_anual.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="objetivo_proximo">Próximo Objetivo</Label>
              <Input
                id="objetivo_proximo"
                {...register('objetivo_proximo')}
              />
              {errors.objetivo_proximo && (
                <p className="text-sm text-destructive mt-1">
                  {errors.objetivo_proximo.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="valor_objetivo">Valor do Objetivo</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  R$
                </span>
                <Input
                  id="valor_objetivo"
                  type="number"
                  step="0.01"
                  className="pl-8"
                  {...register('valor_objetivo', { valueAsNumber: true })}
                />
              </div>
              {errors.valor_objetivo && (
                <p className="text-sm text-destructive mt-1">
                  {errors.valor_objetivo.message}
                </p>
              )}
            </div>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <div className="flex items-center gap-2 text-blue-500">
              <TrendingUp className="w-5 h-5" />
              <p className="font-medium">Dica para Definir Metas</p>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Estabeleça metas realistas e progressivas. Uma boa prática é:
            </p>
            <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
              <li>• Meta diária: média dos últimos 30 dias + 10%</li>
              <li>• Meta mensal: meta diária × dias úteis do mês</li>
              <li>• Meta anual: meta mensal × 12 meses</li>
            </ul>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
            >
              Salvar Metas
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
