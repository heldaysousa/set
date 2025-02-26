import { createBrowserRouter } from 'react-router-dom'
import { authRoutes } from './auth'
import { dashboardRoutes } from './dashboard'
import { clientesRoutes } from './clientes'
import { servicosRoutes } from './servicos'
import { financeiroRoutes } from './financeiro'
import { Layout } from '@/components/Layout'
import { PrivateRoute } from '@/components/PrivateRoute'

export const router = createBrowserRouter([
  ...authRoutes,
  {
    element: (
      <PrivateRoute>
        <Layout />
      </PrivateRoute>
    ),
    children: [
      ...dashboardRoutes,
      ...clientesRoutes,
      ...servicosRoutes,
      ...financeiroRoutes,
    ],
  },
])
