/**
 * @fileoverview Hook para gerenciamento de cache e otimização de performance
 */

import { useCallback, useRef, useEffect } from 'react'

interface CacheConfig {
  ttl?: number // Time to live em milissegundos
  maxSize?: number // Tamanho máximo do cache
}

interface CacheEntry<T> {
  data: T
  timestamp: number
}

interface CacheStore {
  [key: string]: CacheEntry<unknown>
}

const DEFAULT_CONFIG: CacheConfig = {
  ttl: 5 * 60 * 1000, // 5 minutos
  maxSize: 100,
}

export function useCache<T>(config: CacheConfig = {}) {
  const { ttl, maxSize } = { ...DEFAULT_CONFIG, ...config }
  const cacheRef = useRef<CacheStore>({})
  const keysRef = useRef<string[]>([])

  // Limpar entradas expiradas
  const cleanup = useCallback(() => {
    const now = Date.now()
    const cache = cacheRef.current
    const keys = keysRef.current

    keys.forEach((key) => {
      const entry = cache[key]
      if (entry && now - entry.timestamp > ttl!) {
        delete cache[key]
        keys.splice(keys.indexOf(key), 1)
      }
    })
  }, [ttl])

  // Gerenciar tamanho do cache
  const manageSize = useCallback(() => {
    const cache = cacheRef.current
    const keys = keysRef.current

    while (keys.length > maxSize!) {
      const oldestKey = keys.shift()
      if (oldestKey) {
        delete cache[oldestKey]
      }
    }
  }, [maxSize])

  // Definir valor no cache
  const set = useCallback(
    (key: string, data: T) => {
      cleanup()

      const cache = cacheRef.current
      const keys = keysRef.current

      // Remover entrada antiga se existir
      const existingIndex = keys.indexOf(key)
      if (existingIndex > -1) {
        keys.splice(existingIndex, 1)
      }

      // Adicionar nova entrada
      cache[key] = {
        data,
        timestamp: Date.now(),
      }
      keys.push(key)

      manageSize()
    },
    [cleanup, manageSize]
  )

  // Obter valor do cache
  const get = useCallback(
    (key: string): T | null => {
      cleanup()

      const entry = cacheRef.current[key] as CacheEntry<T> | undefined
      if (!entry) return null

      const now = Date.now()
      if (now - entry.timestamp > ttl!) {
        delete cacheRef.current[key]
        keysRef.current.splice(keysRef.current.indexOf(key), 1)
        return null
      }

      return entry.data
    },
    [cleanup, ttl]
  )

  // Remover valor do cache
  const remove = useCallback(
    (key: string) => {
      cleanup()

      delete cacheRef.current[key]
      const index = keysRef.current.indexOf(key)
      if (index > -1) {
        keysRef.current.splice(index, 1)
      }
    },
    [cleanup]
  )

  // Limpar todo o cache
  const clear = useCallback(() => {
    cacheRef.current = {}
    keysRef.current = []
  }, [])

  // Limpar cache expirado periodicamente
  useEffect(() => {
    const interval = setInterval(cleanup, ttl! / 2)
    return () => clearInterval(interval)
  }, [cleanup, ttl])

  return {
    set,
    get,
    remove,
    clear,
    size: keysRef.current.length,
  }
}
