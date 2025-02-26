import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function NotificationsDropdown() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] font-medium text-primary-foreground flex items-center justify-center">
            3
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between px-4 py-2 border-b border-border">
          <span className="text-sm font-medium">Notificações</span>
          <Button variant="ghost" size="sm" className="text-xs">
            Marcar todas como lidas
          </Button>
        </div>
        <div className="py-2">
          <DropdownMenuItem className="flex flex-col items-start gap-1 p-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Novo agendamento</span>
              <span className="text-xs text-muted-foreground">há 5 minutos</span>
            </div>
            <p className="text-sm text-muted-foreground">
              João Silva agendou um corte para hoje às 15:00
            </p>
          </DropdownMenuItem>
          <DropdownMenuItem className="flex flex-col items-start gap-1 p-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Lembrete</span>
              <span className="text-xs text-muted-foreground">há 1 hora</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Você tem 3 agendamentos para hoje
            </p>
          </DropdownMenuItem>
          <DropdownMenuItem className="flex flex-col items-start gap-1 p-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Sistema</span>
              <span className="text-xs text-muted-foreground">há 2 horas</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Backup realizado com sucesso
            </p>
          </DropdownMenuItem>
        </div>
        <div className="p-4 border-t border-border">
          <Button variant="outline" className="w-full">
            Ver todas as notificações
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
