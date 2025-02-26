import React from 'react'
import { useOptimizedImage } from '@/hooks/useOptimizedImage'
import { cn } from '@/lib/utils'

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string
  width?: number
  height?: number
  quality?: number
  format?: 'webp' | 'jpeg' | 'png'
  blur?: number
  fallback?: string
  responsive?: boolean
  sizes?: string
  className?: string
}

export function OptimizedImage({
  src,
  width,
  height,
  quality = 75,
  format = 'webp',
  blur,
  fallback = '/placeholder.png',
  responsive = true,
  sizes = '100vw',
  className,
  alt = '',
  ...props
}: OptimizedImageProps) {
  const { src: optimizedSrc, loading, error, getSrcSet } = useOptimizedImage(src, {
    width,
    height,
    quality,
    format,
    blur
  })

  // Array de larguras para imagens responsivas
  const responsiveWidths = [320, 640, 768, 1024, 1280, 1536]

  if (loading) {
    return (
      <div 
        className={cn(
          'animate-pulse bg-muted rounded-lg',
          className
        )}
        style={{ width, height }}
      />
    )
  }

  if (error || !optimizedSrc) {
    return (
      <img
        src={fallback}
        alt={alt}
        width={width}
        height={height}
        className={cn('rounded-lg', className)}
        {...props}
      />
    )
  }

  return (
    <img
      src={optimizedSrc}
      alt={alt}
      width={width}
      height={height}
      className={cn('rounded-lg', className)}
      {...(responsive && {
        srcSet: getSrcSet(responsiveWidths),
        sizes
      })}
      loading="lazy"
      decoding="async"
      {...props}
    />
  )
}
