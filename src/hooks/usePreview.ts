/**
 * @fileoverview Hook para gerenciar preview dos recursos
 */

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { plans, PlanId } from '@/config/plans'

interface ResourceUsage {
  appointments: number
  professionals: number
  customers: number
}

interface PreviewData {
  currentPlan: PlanId | null
  usage: ResourceUsage
  limits: ResourceUsage
  daysRemaining: number | null
  isTrialing: boolean
  nextBillingDate: Date | null
}

export function usePreview() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [previewData, setPreviewData] = useState<PreviewData>({
    currentPlan: null,
    usage: {
      appointments: 0,
      professionals: 0,
      customers: 0,
    },
    limits: {
      appointments: 0,
      professionals: 0,
      customers: 0,
    },
    daysRemaining: null,
    isTrialing: false,
    nextBillingDate: null,
  })

  useEffect(() => {
    if (user) {
      loadPreviewData()
    }
  }, [user])

  const loadPreviewData = async () => {
    try {
      setLoading(true)

      // Carregar assinatura atual
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user?.id)
        .eq('status', 'active')
        .single()

      if (!subscription) {
        setLoading(false)
        return
      }

      const planId = subscription.plan_id as PlanId
      const plan = plans[planId]

      // Carregar contagens de uso
      const [
        { count: appointmentsCount },
        { count: professionalsCount },
        { count: customersCount },
      ] = await Promise.all([
        supabase
          .from('appointments')
          .select('*', { count: 'exact' })
          .eq('user_id', user?.id),
        supabase
          .from('professionals')
          .select('*', { count: 'exact' })
          .eq('user_id', user?.id),
        supabase
          .from('customers')
          .select('*', { count: 'exact' })
          .eq('user_id', user?.id),
      ])

      // Calcular dias restantes
      const currentPeriodEnd = new Date(subscription.current_period_end)
      const now = new Date()
      const daysRemaining = Math.ceil(
        (currentPeriodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      )

      setPreviewData({
        currentPlan: planId,
        usage: {
          appointments: appointmentsCount || 0,
          professionals: professionalsCount || 0,
          customers: customersCount || 0,
        },
        limits: {
          appointments: plan.features.appointments.limit || Infinity,
          professionals: plan.features.professionals.limit || Infinity,
          customers: plan.features.customers.limit || Infinity,
        },
        daysRemaining,
        isTrialing: subscription.status === 'trialing',
        nextBillingDate: currentPeriodEnd,
      })
    } catch (error) {
      console.error('Erro ao carregar preview:', error)
    } finally {
      setLoading(false)
    }
  }

  const getUsagePercentage = (resource: keyof ResourceUsage) => {
    const usage = previewData.usage[resource]
    const limit = previewData.limits[resource]
    if (limit === Infinity) return 0
    return Math.round((usage / limit) * 100)
  }

  const isNearLimit = (resource: keyof ResourceUsage) => {
    const percentage = getUsagePercentage(resource)
    return percentage >= 80
  }

  const canUseFeature = (feature: string) => {
    if (!previewData.currentPlan) return false
    const plan = plans[previewData.currentPlan]
    return plan.features[feature]?.included || false
  }

  return {
    loading,
    previewData,
    getUsagePercentage,
    isNearLimit,
    canUseFeature,
    refresh: loadPreviewData,
  }
}
