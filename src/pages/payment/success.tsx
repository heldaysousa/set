/**
 * @fileoverview Página de sucesso após pagamento
 */

import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'

export const PaymentSuccess = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user } = useAuth()

  useEffect(() => {
    if (!user) {
      navigate('/auth/login')
    }
  }, [user, navigate])

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-green-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Pagamento realizado com sucesso!
        </h2>
        <p className="text-gray-600 mb-8">
          Seu pagamento foi processado e sua assinatura está ativa.
          Você já pode começar a usar todos os recursos do plano.
        </p>
        <div className="space-y-4">
          <Button
            onClick={() => navigate('/dashboard')}
            className="w-full"
          >
            Ir para o Dashboard
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('/configuracoes')}
            className="w-full"
          >
            Configurar minha conta
          </Button>
        </div>
      </div>
    </div>
  )
}
