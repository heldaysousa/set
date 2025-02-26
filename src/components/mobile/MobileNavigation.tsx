import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { LayoutDashboard, Calendar, Users, Wallet, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

const navigationItems = [
  {
    icon: LayoutDashboard,
    label: 'Dashboard',
    path: '/dashboard'
  },
  {
    icon: Calendar,
    label: 'Agenda',
    path: '/agenda'
  },
  {
    icon: Users,
    label: 'Clientes',
    path: '/clientes'
  },
  {
    icon: Wallet,
    label: 'Financeiro',
    path: '/financeiro'
  },
  {
    icon: Settings,
    label: 'Config',
    path: '/configuracoes'
  }
]

export function MobileNavigation() {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <nav className="mobile-bottom-nav mobile-safe-bottom mobile-optimize">
      {navigationItems.map((item) => {
        const Icon = item.icon
        const isActive = location.pathname === item.path

        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={cn(
              'mobile-nav-item mobile-tap-highlight-none',
              isActive && 'text-primary'
            )}
          >
            <Icon className="w-6 h-6" />
            <span className="mobile-nav-label">{item.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
