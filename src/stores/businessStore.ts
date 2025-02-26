import { create } from 'zustand'
import { BusinessSettings } from '@prisma/client'

interface BusinessState {
  business: BusinessSettings | null
  isLoading: boolean
  error: string | null
  setBusiness: (business: BusinessSettings) => void
  createBusiness: (data: Partial<BusinessSettings>) => Promise<void>
  updateBusiness: (data: Partial<BusinessSettings>) => Promise<void>
  fetchBusiness: (businessId: string) => Promise<void>
}

export const useBusinessStore = create<BusinessState>((set) => ({
  business: null,
  isLoading: false,
  error: null,

  setBusiness: (business) => set({ business }),

  createBusiness: async (data) => {
    try {
      set({ isLoading: true, error: null })
      
      const response = await fetch('/api/business', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        throw new Error('Erro ao criar negócio')
      }

      const business = await response.json()
      set({ business, isLoading: false })
    } catch (error) {
      set({ error: error.message, isLoading: false })
      throw error
    }
  },

  updateBusiness: async (data) => {
    try {
      set({ isLoading: true, error: null })
      
      const response = await fetch(`/api/business/${data.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        throw new Error('Erro ao atualizar negócio')
      }

      const business = await response.json()
      set({ business, isLoading: false })
    } catch (error) {
      set({ error: error.message, isLoading: false })
      throw error
    }
  },

  fetchBusiness: async (businessId) => {
    try {
      set({ isLoading: true, error: null })
      
      const response = await fetch(`/api/business/${businessId}`)
      
      if (!response.ok) {
        throw new Error('Erro ao buscar dados do negócio')
      }

      const business = await response.json()
      set({ business, isLoading: false })
    } catch (error) {
      set({ error: error.message, isLoading: false })
      throw error
    }
  }
}))
