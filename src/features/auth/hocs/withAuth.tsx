import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/features/auth/stores/authStore'
import { Loader } from '@/components/ui/loader'

export function withAuth<P extends object>(Component: React.ComponentType<P>) {
  return function WithAuthComponent(props: P) {
    const { isAuthenticated, isLoading } = useAuthStore()
    const navigate = useNavigate()

    useEffect(() => {
      if (!isLoading && !isAuthenticated) {
        navigate('/login')
      }
    }, [isLoading, isAuthenticated, navigate])

    if (isLoading) {
      return (
        <div className="flex h-screen items-center justify-center">
          <Loader className="h-8 w-8" />
        </div>
      )
    }

    if (!isAuthenticated) {
      return null
    }

    return <Component {...props} />
  }
}
