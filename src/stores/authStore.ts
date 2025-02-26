import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import { toast } from 'sonner'
import { mockUserData } from '../mocks/userData'

type AuthState = {
  user: any
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  initialize: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,

  initialize: async () => {
    try {
      // Usando dados mockados
      set({ user: mockUserData.user })
    } catch (error) {
      console.error('Erro ao inicializar auth:', error)
    }
  },

  signIn: async (email: string, password: string) => {
    try {
      set({ isLoading: true })
      // Simulando login com dados mockados
      if (email === mockUserData.user.email) {
        set({ user: mockUserData.user })
      } else {
        throw new Error('Credenciais inválidas')
      }
    } catch (error: any) {
      console.error('Erro no login:', error)
      toast.error(error.message)
      throw error
    } finally {
      set({ isLoading: false })
    }
  },

  signOut: async () => {
    try {
      set({ user: null })
      toast.success('Logout realizado com sucesso')
    } catch (error: any) {
      console.error('Erro no logout:', error)
      toast.error(error.message)
    }
  }
}))
