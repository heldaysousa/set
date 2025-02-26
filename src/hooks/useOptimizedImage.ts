import { useState, useEffect } from 'react'

interface ImageOptions {
  width?: number
  height?: number
  quality?: number
  format?: 'webp' | 'jpeg' | 'png'
  blur?: number
}

const imageCache = new Map<string, string>()

export function useOptimizedImage(src: string | null, options: ImageOptions = {}) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [optimizedSrc, setOptimizedSrc] = useState<string | null>(null)

  useEffect(() => {
    if (!src) {
      setLoading(false)
      setOptimizedSrc(null)
      return
    }

    const cacheKey = `${src}-${JSON.stringify(options)}`
    
    // Verifica se a imagem já está em cache
    if (imageCache.has(cacheKey)) {
      setOptimizedSrc(imageCache.get(cacheKey)!)
      setLoading(false)
      return
    }

    const loadImage = async () => {
      try {
        setLoading(true)
        setError(null)

        // Cria um objeto URL com os parâmetros de otimização
        const url = new URL(src)
        
        if (options.width) {
          url.searchParams.set('width', options.width.toString())
        }
        if (options.height) {
          url.searchParams.set('height', options.height.toString())
        }
        if (options.quality) {
          url.searchParams.set('quality', options.quality.toString())
        }
        if (options.format) {
          url.searchParams.set('format', options.format)
        }
        if (options.blur) {
          url.searchParams.set('blur', options.blur.toString())
        }

        // Carrega a imagem
        const img = new Image()
        img.src = url.toString()

        await new Promise((resolve, reject) => {
          img.onload = resolve
          img.onerror = reject
        })

        // Armazena em cache
        imageCache.set(cacheKey, url.toString())
        setOptimizedSrc(url.toString())
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Erro ao carregar imagem'))
        setOptimizedSrc(src) // Fallback para URL original
      } finally {
        setLoading(false)
      }
    }

    loadImage()
  }, [src, JSON.stringify(options)])

  return {
    src: optimizedSrc,
    loading,
    error,
    // Função helper para gerar srcSet para imagens responsivas
    getSrcSet: (widths: number[]) => {
      if (!src) return ''
      return widths
        .map(w => {
          const url = new URL(src)
          url.searchParams.set('width', w.toString())
          if (options.quality) {
            url.searchParams.set('quality', options.quality.toString())
          }
          if (options.format) {
            url.searchParams.set('format', options.format)
          }
          return `${url.toString()} ${w}w`
        })
        .join(', ')
    }
  }
}
