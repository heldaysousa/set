import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'

export function PrivateRoute() {
  const { user } = useAuthStore()
  const location = useLocation()

  if (!user) {
    // Salva a localização atual para redirecionar de volta após o login
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <Outlet />
}
