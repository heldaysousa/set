import { PlanCard } from '@/components/plans/PlanCard'
import { usePlansStore } from '@/stores/usePlansStore'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'

export default function PlansPage() {
  const navigate = useNavigate()
  const { plans, selectedPlan, isLoading } = usePlansStore()

  const handleContinue = () => {
    if (selectedPlan) {
      navigate('/plans/preview')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Escolha seu plano</h1>
        <p className="text-xl text-muted-foreground">
          Selecione o plano que melhor atende às suas necessidades
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center mb-12">
        {plans.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            isSelected={selectedPlan === plan.id}
          />
        ))}
      </div>

      <div className="flex justify-center">
        <Button
          size="lg"
          onClick={handleContinue}
          disabled={!selectedPlan}
          className="px-12"
        >
          Continuar
        </Button>
      </div>
    </div>
  )
}
