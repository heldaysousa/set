/**
 * @fileoverview Componente de loading com logo animado
 */

import { Logo } from './Logo'

interface LoadingLogoProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function LoadingLogo({
  size = 'md',
  className = '',
}: LoadingLogoProps) {
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <Logo size={size} animated />
      <div className="mt-4 text-center">
        <p className="text-sm text-muted-foreground">Carregando...</p>
      </div>
    </div>
  )
}
