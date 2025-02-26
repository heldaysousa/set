import { useNavigate, useLocation } from 'react-router-dom'
import { LayoutDashboard, Calendar, Users, Wallet, Settings } from 'lucide-react'
import { Dock, DockIcon, DockItem, DockLabel } from '@/components/ui/dock'
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

export function TopNavigation() {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <nav className="w-full flex justify-center touch-none">
      <Dock 
        className="items-center py-1.5 px-1"
        magnification={32}
        distance={48}
        panelHeight={32}
        spring={{ mass: 0.2, stiffness: 300, damping: 25 }}
      >
        {navigationItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname.startsWith(item.path)

          return (
            <DockItem
              key={item.path}
              className={cn(
                "aspect-square rounded-lg transition-colors mobile-tap-highlight-none",
                isActive 
                  ? "bg-primary/10 text-primary ring-1 ring-primary/20" 
                  : "text-muted-foreground/80 hover:text-muted-foreground hover:bg-muted/40"
              )}
              onClick={() => navigate(item.path)}
            >
              <DockLabel 
                className={cn(
                  "text-[10px] font-medium tracking-tight px-2 py-1 backdrop-blur-sm",
                  isActive ? "bg-background/80" : "bg-background/60"
                )}
              >
                {item.label}
              </DockLabel>
              <DockIcon>
                <Icon className="h-4 w-4 stroke-[1.5]" />
              </DockIcon>
            </DockItem>
          )
        })}
      </Dock>
    </nav>
  )
}
