import React, { memo } from 'react'
import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

interface OptimizedIconProps {
  icon: LucideIcon
  className?: string
  strokeWidth?: number
  size?: number
  isActive?: boolean
}

export const OptimizedIcon = memo(function OptimizedIcon({
  icon: Icon,
  className,
  strokeWidth = 1.5,
  size = 24,
  isActive = false
}: OptimizedIconProps) {
  return (
    <Icon
      className={cn(
        'transition-all duration-200 ease-in-out',
        isActive ? 'text-primary' : 'text-muted-foreground',
        className
      )}
      strokeWidth={strokeWidth}
      size={size}
    />
  )
})
