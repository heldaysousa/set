import React from 'react'
import { Outlet } from 'react-router-dom'
import { TopNavigation } from '@/components/mobile/TopNavigation'
import { Bell, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ThemeToggle'
import { NotificationsDropdown } from '@/components/NotificationsDropdown'
import { Logo } from '@/components/Logo'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { cn } from '@/lib/utils'

export function MobileLayout() {
  const isMobile = useMediaQuery('(max-width: 768px)')

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="mobile-header mobile-safe-top border-b border-border/10 bg-background/95 backdrop-blur-lg">
        <div className="flex items-center justify-between px-2.5 h-9">
          <Logo size="sm" className="scale-[0.8]" />
          
          <div className="flex items-center gap-0.5">
            <NotificationsDropdown />
            <ThemeToggle />
          </div>
        </div>

        {/* Navegação Superior apenas em Mobile */}
        {isMobile && (
          <div className="border-t border-border/5 bg-background/90">
            <TopNavigation />
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className={cn(
        "mobile-container",
        isMobile ? "pt-0.5 pb-6" : "py-6",
        "bg-gradient-to-b from-background via-background to-muted/5"
      )}>
        <Outlet />
      </main>
    </div>
  )
}
