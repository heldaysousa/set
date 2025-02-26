import { Plan } from '@/config/plans'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Check, X } from 'lucide-react'
import { usePlansStore } from '@/stores/usePlansStore'

interface PlanCardProps {
  plan: Plan
  isSelected?: boolean
  onSelect?: () => void
}

export function PlanCard({ plan, isSelected = false, onSelect }: PlanCardProps) {
  const setSelectedPlan = usePlansStore(state => state.setSelectedPlan)

  const handleSelect = () => {
    setSelectedPlan(plan.id)
    onSelect?.()
  }

  return (
    <Card className={`w-[350px] ${isSelected ? 'border-primary' : ''}`}>
      <CardHeader>
        <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
        <CardDescription>{plan.description}</CardDescription>
        <div className="mt-4">
          <span className="text-4xl font-bold">R$ {plan.price.toFixed(2)}</span>
          <span className="text-muted-foreground">/mês</span>
        </div>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2">
              {feature.included ? (
                <Check className="h-5 w-5 text-green-500 mt-0.5" />
              ) : (
                <X className="h-5 w-5 text-red-500 mt-0.5" />
              )}
              <div>
                <p className="font-medium">{feature.title}</p>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                  {feature.limit ? ` (até ${feature.limit})` : ''}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full" 
          variant={isSelected ? "secondary" : "default"}
          onClick={handleSelect}
        >
          {isSelected ? 'Plano Selecionado' : 'Selecionar Plano'}
        </Button>
      </CardFooter>
    </Card>
  )
}
