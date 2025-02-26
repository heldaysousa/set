/**
 * @fileoverview Layout padrão para páginas autenticadas do CEO Express
 */

import React, { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { LogOut, Bell, LayoutDashboard, Calendar, Users, FileText, Settings, Wallet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ThemeToggle } from '@/components/ThemeToggle'
import { NotificationsDropdown } from '@/components/NotificationsDropdown'
import { Logo } from '@/components/Logo'
import { Sidebar, SidebarBody, SidebarLink } from '@/components/ui/sidebar'
import { useTheme } from '@/hooks/useTheme'

export function DashboardLayout() {
  const { user, signOut } = useAuthStore()
  const [open, setOpen] = useState(false)
  const { theme } = useTheme()

  // Aplica o tema ao documento inteiro
  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark')
    document.documentElement.classList.add(theme)
  }, [theme])

  const links = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: <LayoutDashboard className="h-5 w-5 text-muted-foreground" />,
    },
    {
      label: "Agenda",
      href: "/agenda",
      icon: <Calendar className="h-5 w-5 text-muted-foreground" />,
    },
    {
      label: "Clientes",
      href: "/clientes",
      icon: <Users className="h-5 w-5 text-muted-foreground" />,
    },
    {
      label: "Financeiro",
      href: "/financeiro",
      icon: <Wallet className="h-5 w-5 text-muted-foreground" />,
    },
    {
      label: "Configurações",
      href: "/configuracoes",
      icon: <Settings className="h-5 w-5 text-muted-foreground" />,
    },
  ]

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
            <Logo size="lg" />
            <div className="mt-8 flex flex-col gap-2">
              {links.map((link, idx) => (
                <SidebarLink key={idx} link={link} />
              ))}
            </div>
          </div>
          <div>
            <SidebarLink
              link={{
                label: user?.name || "",
                href: "/perfil",
                icon: (
                  <Avatar>
                    <AvatarImage src={user?.avatar} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {user?.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                ),
              }}
            />
          </div>
        </SidebarBody>
      </Sidebar>

      <div className="flex-1 flex flex-col">
        <header className="h-16 px-6 bg-background/80 backdrop-blur-sm z-40 flex items-center justify-end border-b border-border">
          <div className="flex items-center gap-6">
            <NotificationsDropdown />
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => signOut()}
              className="text-muted-foreground hover:text-foreground hover:bg-background-hover"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </header>

        <main className="flex-1 p-6 bg-background">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
