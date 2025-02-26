/**
 * @fileoverview Webhook handler para eventos do Kiwify
 */

import { NextApiRequest, NextApiResponse } from 'next'
import { paymentService } from '@/services/payment'
import { supabase } from '@/lib/supabase'

// Verificar assinatura do webhook
const verifyWebhookSignature = (req: NextApiRequest): boolean => {
  const signature = req.headers['x-kiwify-signature']
  // Implementar verificação da assinatura do webhook
  return true
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Verificar método
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Método não permitido' })
    }

    // Verificar assinatura
    if (!verifyWebhookSignature(req)) {
      return res.status(401).json({ error: 'Assinatura inválida' })
    }

    const event = req.body

    // Processar diferentes tipos de eventos
    switch (event.type) {
      case 'subscription.created':
        // Criar nova assinatura
        await supabase.from('subscriptions').insert({
          id: event.data.id,
          user_id: event.data.metadata.user_id,
          plan_id: event.data.plan.id,
          status: 'active',
          current_period_start: event.data.current_period_start,
          current_period_end: event.data.current_period_end,
          payment_status: 'paid',
        })
        break

      case 'subscription.updated':
        // Atualizar assinatura existente
        await paymentService.updateSubscription({
          subscriptionId: event.data.id,
          status: event.data.status,
          currentPeriodEnd: event.data.current_period_end,
          paymentStatus: event.data.payment_status,
        })
        break

      case 'subscription.canceled':
        // Cancelar assinatura
        await paymentService.updateSubscription({
          subscriptionId: event.data.id,
          status: 'canceled',
          currentPeriodEnd: event.data.current_period_end,
          paymentStatus: event.data.payment_status,
        })
        break

      case 'subscription.expired':
        // Marcar assinatura como expirada
        await paymentService.updateSubscription({
          subscriptionId: event.data.id,
          status: 'expired',
          currentPeriodEnd: event.data.current_period_end,
          paymentStatus: 'failed',
        })
        break

      case 'payment.succeeded':
        // Atualizar status do pagamento
        await paymentService.updateSubscription({
          subscriptionId: event.data.subscription_id,
          status: 'active',
          currentPeriodEnd: event.data.current_period_end,
          paymentStatus: 'paid',
        })
        break

      case 'payment.failed':
        // Marcar pagamento como falho
        await paymentService.updateSubscription({
          subscriptionId: event.data.subscription_id,
          status: 'active',
          currentPeriodEnd: event.data.current_period_end,
          paymentStatus: 'failed',
        })
        break

      default:
        console.log('Evento não processado:', event.type)
    }

    res.status(200).json({ received: true })
  } catch (error) {
    console.error('Erro ao processar webhook:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
}
