/**
 * @fileoverview Página de preview dos planos
 */

import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePlansStore } from '@/stores/usePlansStore'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Check } from 'lucide-react'

export default function PlanPreviewPage() {
  const navigate = useNavigate()
  const { getSelectedPlan, selectedPlan } = usePlansStore()
  const plan = getSelectedPlan()

  useEffect(() => {
    if (!selectedPlan) {
      navigate('/plans')
    }
  }, [selectedPlan, navigate])

  if (!plan) {
    return null
  }

  const handleBack = () => {
    navigate('/plans')
  }

  const handleConfirm = () => {
    // TODO: Implementar integração com gateway de pagamento
    navigate('/dashboard')
  }

  return (
    <div className="container mx-auto py-12">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Confirme seu plano</h1>
          <p className="text-xl text-muted-foreground">
            Revise os detalhes do plano selecionado antes de prosseguir
          </p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-3xl font-bold">{plan.name}</CardTitle>
            <CardDescription className="text-lg">{plan.description}</CardDescription>
            <div className="mt-4">
              <span className="text-5xl font-bold">R$ {plan.price.toFixed(2)}</span>
              <span className="text-xl text-muted-foreground">/mês</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6">
              <div>
                <h3 className="text-xl font-semibold mb-4">Recursos incluídos:</h3>
                <ul className="space-y-4">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="h-6 w-6 text-green-500 mt-0.5" />
                      <div>
                        <p className="font-medium text-lg">{feature.title}</p>
                        <p className="text-muted-foreground">
                          {feature.description}
                          {feature.limit ? ` (até ${feature.limit})` : ''}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-4">Termos importantes:</h3>
                <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                  <li>Cobrança mensal recorrente</li>
                  <li>Cancelamento pode ser feito a qualquer momento</li>
                  <li>Suporte técnico incluso</li>
                  <li>Atualizações gratuitas</li>
                </ul>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex gap-4 justify-end">
            <Button variant="outline" onClick={handleBack}>
              Voltar
            </Button>
            <Button size="lg" onClick={handleConfirm}>
              Confirmar e Prosseguir
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
