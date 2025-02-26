import React, { useMemo } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { OptimizedIcon } from '@/components/ui/optimized-icon'
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  Scissors, 
  DollarSign,
  Settings
} from 'lucide-react'

const menuItems = [
  {
    path: '/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard
  },
  {
    path: '/agenda',
    label: 'Agenda',
    icon: Calendar
  },
  {
    path: '/clientes',
    label: 'Clientes',
    icon: Users
  },
  {
    path: '/servicos',
    label: 'Serviços',
    icon: Scissors
  },
  {
    path: '/financeiro',
    label: 'Financeiro',
    icon: DollarSign
  },
  {
    path: '/configuracoes',
    label: 'Configurações',
    icon: Settings
  }
]

export function Sidebar() {
  const location = useLocation()
  
  const renderedMenuItems = useMemo(() => 
    menuItems.map(({ path, label, icon }) => {
      const isActive = location.pathname === path || location.pathname === path.replace('/dashboard', '/')
      
      return (
        <NavLink
          key={path}
          to={path}
          className={cn(
            'flex items-center gap-3 px-4 py-2 rounded-lg transition-colors',
            'hover:bg-accent hover:text-accent-foreground',
            isActive && 'bg-accent text-accent-foreground'
          )}
        >
          <OptimizedIcon 
            icon={icon}
            isActive={isActive}
            size={20}
          />
          <span className="text-sm font-medium">{label}</span>
        </NavLink>
      )
    }),
    [location.pathname]
  )

  return (
    <aside className="hidden lg:flex flex-col w-64 border-r px-4 py-6">
      <div className="flex flex-col gap-2">
        {renderedMenuItems}
      </div>
    </aside>
  )
}
