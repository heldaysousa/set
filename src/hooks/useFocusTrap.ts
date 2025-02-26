/**
 * @fileoverview Hook para gerenciamento de foco e navegação por teclado
 */

import { useCallback, useEffect, useRef } from 'react'

interface FocusTrapOptions {
  enabled?: boolean
  autoFocus?: boolean
  returnFocusOnUnmount?: boolean
}

export function useFocusTrap(options: FocusTrapOptions = {}) {
  const {
    enabled = true,
    autoFocus = true,
    returnFocusOnUnmount = true,
  } = options

  const containerRef = useRef<HTMLElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  // Obter elementos focáveis
  const getFocusableElements = useCallback(() => {
    if (!containerRef.current) return []

    return Array.from(
      containerRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
    ).filter((element) => {
      return (
        !element.hasAttribute('disabled') &&
        !element.hasAttribute('aria-hidden') &&
        element.getAttribute('tabindex') !== '-1'
      )
    })
  }, [])

  // Focar primeiro elemento
  const focusFirstElement = useCallback(() => {
    const elements = getFocusableElements()
    if (elements.length > 0) {
      elements[0].focus()
    } else if (containerRef.current) {
      containerRef.current.focus()
    }
  }, [getFocusableElements])

  // Focar último elemento
  const focusLastElement = useCallback(() => {
    const elements = getFocusableElements()
    if (elements.length > 0) {
      elements[elements.length - 1].focus()
    }
  }, [getFocusableElements])

  // Gerenciar navegação por teclado
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return

      const elements = getFocusableElements()
      if (elements.length === 0) return

      const firstElement = elements[0]
      const lastElement = elements[elements.length - 1]
      const activeElement = document.activeElement

      // Tab
      if (event.key === 'Tab') {
        if (event.shiftKey) {
          // Shift + Tab
          if (activeElement === firstElement) {
            event.preventDefault()
            lastElement.focus()
          }
        } else {
          // Tab
          if (activeElement === lastElement) {
            event.preventDefault()
            firstElement.focus()
          }
        }
      }

      // Esc
      if (event.key === 'Escape') {
        event.preventDefault()
        containerRef.current?.focus()
      }
    },
    [enabled, getFocusableElements]
  )

  // Configurar trap de foco
  useEffect(() => {
    if (!enabled) return

    const container = containerRef.current
    if (!container) return

    // Salvar elemento com foco anterior
    previousFocusRef.current = document.activeElement as HTMLElement

    // Configurar atributos ARIA
    container.setAttribute('role', 'dialog')
    container.setAttribute('aria-modal', 'true')
    container.setAttribute('tabindex', '-1')

    // Auto-focus
    if (autoFocus) {
      focusFirstElement()
    }

    // Adicionar event listeners
    container.addEventListener('keydown', handleKeyDown)

    return () => {
      container.removeEventListener('keydown', handleKeyDown)

      // Restaurar foco anterior
      if (returnFocusOnUnmount && previousFocusRef.current) {
        previousFocusRef.current.focus()
      }
    }
  }, [enabled, autoFocus, returnFocusOnUnmount, handleKeyDown, focusFirstElement])

  return {
    containerRef,
    focusFirstElement,
    focusLastElement,
  }
}
