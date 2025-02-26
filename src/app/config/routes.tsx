import { createBrowserRouter } from 'react-router-dom'
import { AppLayout } from '../../components/layout/AppLayout'
import { AuthLayout } from '../../components/layout/AuthLayout'
import { LoginPage } from '../../features/auth/pages/LoginPage'
import { RegisterPage } from '../../features/auth/pages/RegisterPage'
import { DashboardPage } from '../../features/dashboard/pages/DashboardPage'
import { PrivateRoute } from '../../components/auth/PrivateRoute'
import { Agenda } from '../../pages/agenda'
import { Clientes } from '../../pages/clientes'
import { Servicos } from '../../pages/servicos'
import { Financeiro } from '../../pages/financeiro'
import { Configuracoes } from '../../pages/configuracoes'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <PrivateRoute />,
    children: [
      {
        path: '/',
        element: <AppLayout />,
        children: [
          {
            path: '/',
            element: <DashboardPage />
          },
          {
            path: '/agenda',
            element: <Agenda />
          },
          {
            path: '/clientes',
            element: <Clientes />
          },
          {
            path: '/servicos',
            element: <Servicos />
          },
          {
            path: '/financeiro',
            element: <Financeiro />
          },
          {
            path: '/configuracoes',
            element: <Configuracoes />
          }
        ]
      }
    ]
  },
  {
    path: '/auth',
    element: <AuthLayout />,
    children: [
      {
        path: 'login',
        element: <LoginPage />
      },
      {
        path: 'register',
        element: <RegisterPage />
      }
    ]
  }
])
