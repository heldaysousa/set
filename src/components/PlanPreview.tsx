/**
 * @fileoverview Componente de preview do plano atual
 */

import { motion } from 'framer-motion'
import { usePreview } from '@/hooks/usePreview'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Calendar,
  Users,
  Clock,
  AlertTriangle,
  ArrowUpCircle,
} from 'lucide-react'
import { plans } from '@/config/plans'
import { useNavigate } from 'react-router-dom'

export function PlanPreview() {
  const navigate = useNavigate()
  const { loading, previewData, getUsagePercentage, isNearLimit } = usePreview()

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-64 bg-white/5 rounded-lg" />
      </div>
    )
  }

  if (!previewData.currentPlan) {
    return (
      <Card className="bg-white/10 border-gray-800">
        <CardHeader>
          <CardTitle>Sem Plano Ativo</CardTitle>
          <CardDescription>
            Escolha um plano para começar a usar os recursos
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button
            className="w-full bg-blue-500 hover:bg-blue-600"
            onClick={() => navigate('/plans')}
          >
            Ver Planos
          </Button>
        </CardFooter>
      </Card>
    )
  }

  const plan = plans[previewData.currentPlan]

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500'
    if (percentage >= 70) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  return (
    <Card className="bg-white/10 border-gray-800">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Seu Plano: {plan.name}</span>
          <span className="text-blue-400">
            R$ {plan.price.toFixed(2)}/mês
          </span>
        </CardTitle>
        <CardDescription>{plan.description}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Status do Período */}
        <div className="flex items-center justify-between p-4 rounded-lg bg-white/5">
          <div className="flex items-center space-x-3">
            <Clock className="w-5 h-5 text-blue-400" />
            <div>
              <p className="font-medium">Período Atual</p>
              <p className="text-sm text-gray-400">
                {previewData.daysRemaining} dias restantes
              </p>
            </div>
          </div>
          {previewData.isTrialing && (
            <span className="px-3 py-1 text-sm bg-blue-500/20 text-blue-400 rounded-full">
              Período de Teste
            </span>
          )}
        </div>

        {/* Uso de Recursos */}
        <div className="space-y-4">
          {/* Agendamentos */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span>Agendamentos</span>
              </div>
              <span className="text-sm text-gray-400">
                {previewData.usage.appointments} de{' '}
                {previewData.limits.appointments === Infinity
                  ? 'Ilimitado'
                  : previewData.limits.appointments}
              </span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className={`h-full ${getUsageColor(getUsagePercentage('appointments'))}`}
                style={{ width: `${getUsagePercentage('appointments')}%` }}
                initial={{ width: 0 }}
                animate={{ width: `${getUsagePercentage('appointments')}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          {/* Profissionais */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-gray-400" />
                <span>Profissionais</span>
              </div>
              <span className="text-sm text-gray-400">
                {previewData.usage.professionals} de{' '}
                {previewData.limits.professionals === Infinity
                  ? 'Ilimitado'
                  : previewData.limits.professionals}
              </span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className={`h-full ${getUsageColor(getUsagePercentage('professionals'))}`}
                style={{ width: `${getUsagePercentage('professionals')}%` }}
                initial={{ width: 0 }}
                animate={{ width: `${getUsagePercentage('professionals')}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          {/* Clientes */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-gray-400" />
                <span>Clientes</span>
              </div>
              <span className="text-sm text-gray-400">
                {previewData.usage.customers} de{' '}
                {previewData.limits.customers === Infinity
                  ? 'Ilimitado'
                  : previewData.limits.customers}
              </span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className={`h-full ${getUsageColor(getUsagePercentage('customers'))}`}
                style={{ width: `${getUsagePercentage('customers')}%` }}
                initial={{ width: 0 }}
                animate={{ width: `${getUsagePercentage('customers')}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        </div>

        {/* Alertas */}
        {(isNearLimit('appointments') ||
          isNearLimit('professionals') ||
          isNearLimit('customers')) && (
          <div className="flex items-start space-x-3 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
            <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5" />
            <div>
              <h4 className="font-semibold text-yellow-400">
                Limite Próximo
              </h4>
              <p className="text-sm text-gray-400">
                Você está próximo do limite em alguns recursos. Considere fazer um upgrade do seu plano.
              </p>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="space-x-4">
        <Button
          className="flex-1 bg-blue-500 hover:bg-blue-600"
          onClick={() => navigate('/plans')}
        >
          <ArrowUpCircle className="w-4 h-4 mr-2" />
          Fazer Upgrade
        </Button>
      </CardFooter>
    </Card>
  )
}
