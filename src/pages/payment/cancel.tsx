/**
 * @fileoverview Página de cancelamento do pagamento
 */

import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Logo } from '@/components/Logo'
import { Button } from '@/components/ui/button'
import { XCircle } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

export const PaymentCancel = () => {
  const navigate = useNavigate()
  const { user } = useAuth()

  useEffect(() => {
    if (!user) {
      navigate('/auth/login')
    }
  }, [user, navigate])

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Pagamento não concluído
        </h2>
        <p className="text-gray-600 mb-8">
          Houve um problema ao processar seu pagamento.
          Por favor, tente novamente ou entre em contato com o suporte.
        </p>
        <div className="space-y-4">
          <Button
            onClick={() => navigate('/plans')}
            className="w-full"
          >
            Tentar novamente
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('/support')}
            className="w-full"
          >
            Contatar suporte
          </Button>
        </div>
      </div>
    </div>
  )
}
