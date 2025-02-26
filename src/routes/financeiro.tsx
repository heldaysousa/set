import { lazy } from 'react'
import { RouteObject } from 'react-router-dom'

const Financeiro = lazy(() => import('@/pages/financeiro'))

export const financeiroRoutes: RouteObject[] = [
  {
    path: '/financeiro',
    element: <Financeiro />,
  }
]
