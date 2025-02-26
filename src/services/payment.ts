/**
 * @fileoverview Serviço de integração com plataforma de pagamento
 */

import { supabase } from '@/lib/supabase'
import { monitoring } from './monitoring'

// Mapeamento de planos do Kiwify
const KIWIFY_PLAN_IDS = {
  starter: 'plan_starter',
  pro: 'plan_pro',
  enterprise: 'plan_enterprise',
} as const

type PlanId = keyof typeof KIWIFY_PLAN_IDS

interface CreateCheckoutOptions {
  planId: string
  userId: string
  userEmail: string
  userName: string
}

interface UpdateSubscriptionOptions {
  subscriptionId: string
  status: 'active' | 'trialing' | 'canceled' | 'expired'
  currentPeriodEnd: string
  paymentStatus: 'paid' | 'pending' | 'failed'
}

interface PaymentConfig {
  apiKey: string
  apiUrl: string
}

interface PaymentMethod {
  id: string
  type: 'credit_card' | 'pix' | 'boleto'
  last4?: string
  brand?: string
}

interface Subscription {
  id: string
  status: 'active' | 'canceled' | 'past_due'
  current_period_end: string
  cancel_at_period_end: boolean
}

class PaymentService {
  private config: PaymentConfig

  constructor(config: PaymentConfig) {
    this.config = config
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.config.apiUrl}${endpoint}`
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.config.apiKey}`,
      ...options.headers,
    }

    try {
      monitoring.markStart(`payment_request_${endpoint}`)
      const response = await fetch(url, { ...options, headers })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data as T
    } catch (error) {
      monitoring.trackError({
        level: 'error',
        message: `Payment request failed: ${endpoint}`,
        error: error instanceof Error ? error : new Error('Unknown error'),
      })
      throw error
    } finally {
      monitoring.markEnd(`payment_request_${endpoint}`)
    }
  }

  async createCheckoutSession(planId: string, userId: string) {
    try {
      monitoring.markStart('create_checkout_session')
      const data = await this.request('/checkout/sessions', {
        method: 'POST',
        body: JSON.stringify({
          plan_id: planId,
          customer_id: userId,
          success_url: `${window.location.origin}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${window.location.origin}/plans`,
        }),
      })

      monitoring.trackUserAction('checkout_session_created', userId, {
        planId,
      })

      return data
    } catch (error) {
      monitoring.trackError({
        level: 'error',
        message: 'Failed to create checkout session',
        error: error instanceof Error ? error : new Error('Unknown error'),
        context: { planId, userId },
      })
      throw error
    } finally {
      monitoring.markEnd('create_checkout_session')
    }
  }

  async getPaymentMethods(userId: string): Promise<PaymentMethod[]> {
    return this.request(`/customers/${userId}/payment_methods`)
  }

  async getSubscription(userId: string): Promise<Subscription | null> {
    return this.request(`/customers/${userId}/subscription`)
  }

  async cancelSubscription(
    userId: string,
    atPeriodEnd: boolean = true
  ): Promise<void> {
    try {
      monitoring.markStart('cancel_subscription')
      await this.request(`/customers/${userId}/subscription`, {
        method: 'DELETE',
        body: JSON.stringify({ at_period_end: atPeriodEnd }),
      })

      monitoring.trackUserAction('subscription_cancelled', userId, {
        atPeriodEnd,
      })
    } catch (error) {
      monitoring.trackError({
        level: 'error',
        message: 'Failed to cancel subscription',
        error: error instanceof Error ? error : new Error('Unknown error'),
        context: { userId, atPeriodEnd },
      })
      throw error
    } finally {
      monitoring.markEnd('cancel_subscription')
    }
  }
}

export const payment = new PaymentService({
  apiKey: process.env.VITE_PAYMENT_API_KEY || '',
  apiUrl: process.env.VITE_PAYMENT_API_URL || '',
})

export const paymentService = {
  // Criar checkout para nova assinatura
  async createCheckout({
    planId,
    userId,
    userEmail,
    userName,
  }: CreateCheckoutOptions) {
    try {
      // Configuração do checkout no Kiwify
      const response = await fetch('https://api.kiwify.com.br/v1/checkouts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_KIWIFY_API_KEY}`,
        },
        body: JSON.stringify({
          plan_id: KIWIFY_PLAN_IDS[planId],
          customer: {
            email: userEmail,
            name: userName,
          },
          metadata: {
            user_id: userId,
          },
          success_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success`,
          cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/cancel`,
        }),
      })

      const data = await response.json()
      return data.checkout_url
    } catch (error) {
      console.error('Erro ao criar checkout:', error)
      throw new Error('Não foi possível criar o checkout')
    }
  },

  // Atualizar status da assinatura
  async updateSubscription({
    subscriptionId,
    status,
    currentPeriodEnd,
    paymentStatus,
  }: UpdateSubscriptionOptions) {
    try {
      const { error } = await supabase
        .from('subscriptions')
        .update({
          status,
          current_period_end: currentPeriodEnd,
          payment_status: paymentStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', subscriptionId)

      if (error) throw error
    } catch (error) {
      console.error('Erro ao atualizar assinatura:', error)
      throw new Error('Não foi possível atualizar a assinatura')
    }
  },

  // Cancelar assinatura
  async cancelSubscription(subscriptionId: string) {
    try {
      // Cancelar no Kiwify
      await fetch(`https://api.kiwify.com.br/v1/subscriptions/${subscriptionId}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_KIWIFY_API_KEY}`,
        },
      })

      // Atualizar no banco
      const { error } = await supabase
        .from('subscriptions')
        .update({
          status: 'canceled',
          cancel_at_period_end: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', subscriptionId)

      if (error) throw error
    } catch (error) {
      console.error('Erro ao cancelar assinatura:', error)
      throw new Error('Não foi possível cancelar a assinatura')
    }
  },

  // Reativar assinatura cancelada
  async reactivateSubscription(subscriptionId: string) {
    try {
      // Reativar no Kiwify
      await fetch(`https://api.kiwify.com.br/v1/subscriptions/${subscriptionId}/reactivate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_KIWIFY_API_KEY}`,
        },
      })

      // Atualizar no banco
      const { error } = await supabase
        .from('subscriptions')
        .update({
          status: 'active',
          cancel_at_period_end: false,
          updated_at: new Date().toISOString(),
        })
        .eq('id', subscriptionId)

      if (error) throw error
    } catch (error) {
      console.error('Erro ao reativar assinatura:', error)
      throw new Error('Não foi possível reativar a assinatura')
    }
  },

  async createSubscription(planId: PlanId) {
    const { data, error } = await supabase.functions.invoke('create-subscription', {
      body: {
        plan_id: KIWIFY_PLAN_IDS[planId],
      },
    })

    if (error) {
      throw new Error(error.message)
    }

    return data
  },
}
