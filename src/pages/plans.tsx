/**
 * @fileoverview Página de planos e assinatura
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Logo } from '@/components/Logo'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Check } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'sonner'
import { monitoring } from '@/services/monitoring'
import { clsx } from 'clsx'

const plans = [
  {
    id: 'starter',
    name: 'Starter',
    price: 'R$ 49,90',
    description: 'Ideal para profissionais autônomos',
    features: [
      'Até 50 agendamentos/mês',
      '1 profissional',
      'Até 100 clientes',
      'Agenda online',
      'Lembretes por WhatsApp',
    ],
  },
  {
    id: 'pro',
    name: 'Professional',
    price: 'R$ 99,90',
    description: 'Perfeito para pequenos salões',
    features: [
      'Até 200 agendamentos/mês',
      'Até 5 profissionais',
      'Até 500 clientes',
      'Agenda online',
      'Lembretes por WhatsApp',
      'Relatórios básicos',
      'Controle financeiro',
    ],
  },
  {
    id: 'business',
    name: 'Business',
    price: 'R$ 199,90',
    description: 'Para salões em crescimento',
    features: [
      'Agendamentos ilimitados',
      'Até 15 profissionais',
      'Clientes ilimitados',
      'Agenda online',
      'Lembretes por WhatsApp',
      'Relatórios avançados',
      'Controle financeiro completo',
      'Gestão de estoque',
      'Marketing integrado',
    ],
  },
]

export default function PlansPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)

  const handleSelectPlan = async (planId: string) => {
    try {
      setSelectedPlan(planId)
      monitoring.markStart('select_plan')

      // Aqui você implementaria a lógica de checkout
      const checkoutUrl = `https://kiwify.app/checkout?plan=${planId}`
      window.location.href = checkoutUrl

      monitoring.trackUserAction('plan_selected', user?.id || '', {
        planId,
      })
    } catch (error) {
      console.error('Erro ao selecionar plano:', error)
      monitoring.trackError({
        level: 'error',
        message: 'Erro ao selecionar plano',
        error: error instanceof Error ? error : new Error('Erro desconhecido'),
        context: { planId },
      })
      toast.error('Erro ao selecionar plano. Tente novamente.')
    } finally {
      setSelectedPlan(null)
      monitoring.markEnd('select_plan')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-black text-white">
      <div className="container mx-auto min-h-screen py-12">
        {/* Logo */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex justify-center mb-12"
        >
          <Logo size="lg" />
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold mb-4">
            Escolha o plano ideal para seu negócio
          </h1>
          <p className="text-xl text-gray-400">
            Comece com 7 dias de garantia e transforme seu negócio
          </p>
        </motion.div>

        {/* Planos */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
            >
              <Card className={clsx(
                'relative h-full',
                {
                  'border-blue-500 shadow-blue-500/20 shadow-lg': selectedPlan === plan.id,
                  'bg-white/10 border-gray-800': selectedPlan !== plan.id
                }
              )}>
                {selectedPlan === plan.id && (
                  <div className="absolute -top-4 left-0 right-0 flex justify-center">
                    <span className="bg-blue-500 text-white text-sm font-medium px-4 py-1 rounded-full">
                      Selecionado
                    </span>
                  </div>
                )}

                <CardHeader>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="flex items-baseline">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-gray-400 ml-2">/mês</span>
                  </div>

                  <ul className="space-y-2">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center">
                        <Check className="h-5 w-5 text-green-500 mr-2" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter>
                  <Button
                    size="lg"
                    className={clsx(
                      'w-full',
                      {
                        'bg-blue-500 hover:bg-blue-600': selectedPlan === plan.id,
                        'bg-white/10 hover:bg-white/20': selectedPlan !== plan.id
                      }
                    )}
                    onClick={() => handleSelectPlan(plan.id)}
                    disabled={selectedPlan === plan.id}
                  >
                    {selectedPlan === plan.id ? 'Processando...' : 'Selecionar plano'}
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Garantias */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-16 text-center space-y-4"
        >
          <div className="flex items-center justify-center space-x-8">
            <div>
              <h3 className="text-xl font-semibold mb-2">🛡️ Garantia de 7 dias</h3>
              <p className="text-gray-400">
                Não gostou? Devolvemos seu dinheiro
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2">📅 Compromisso mínimo</h3>
              <p className="text-gray-400">
                Apenas 90 dias para testar tudo
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2">🔒 Pagamento Seguro</h3>
              <p className="text-gray-400">
                Ambiente seguro e criptografado
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
