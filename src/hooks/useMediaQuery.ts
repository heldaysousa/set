import { useState, useEffect } from 'react'

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const media = window.matchMedia(query)
    
    // Função para atualizar o estado
    const updateMatches = () => {
      setMatches(media.matches)
    }

    // Verifica inicialmente
    updateMatches()

    // Adiciona listener para mudanças
    if (media.addListener) {
      media.addListener(updateMatches)
    } else {
      media.addEventListener('change', updateMatches)
    }

    // Cleanup
    return () => {
      if (media.removeListener) {
        media.removeListener(updateMatches)
      } else {
        media.removeEventListener('change', updateMatches)
      }
    }
  }, [query])

  return matches
}
