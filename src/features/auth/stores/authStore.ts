import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '@/lib/supabase'
import type { User, AuthData } from '@/types/supabase'

interface AuthState extends AuthData {
  initialize: () => Promise<void>
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name: string) => Promise<void>
  logout: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      session: null,
      error: null,
      isAuthenticated: false,
      isLoading: true,
      business: null,

      initialize: async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession()
          
          if (session) {
            const { data: user } = await supabase
              .from('users')
              .select('*')
              .eq('id', session.user.id)
              .single()

            const { data: business } = await supabase
              .from('businesses')
              .select('*')
              .eq('owner_id', session.user.id)
              .single()

            set({
              user,
              session,
              business,
              isAuthenticated: true,
              isLoading: false,
              error: null
            })
          } else {
            set({
              user: null,
              session: null,
              business: null,
              isAuthenticated: false,
              isLoading: false,
              error: null
            })
          }
        } catch (error: any) {
          set({
            user: null,
            session: null,
            business: null,
            isAuthenticated: false,
            isLoading: false,
            error: error.message
          })
        }
      },

      login: async (email: string, password: string) => {
        try {
          const { data: { session }, error } = await supabase.auth.signInWithPassword({
            email,
            password
          })

          if (error) throw error

          const { data: user } = await supabase
            .from('users')
            .select('*')
            .eq('id', session?.user.id)
            .single()

          const { data: business } = await supabase
            .from('businesses')
            .select('*')
            .eq('owner_id', session?.user.id)
            .single()

          set({
            user,
            session,
            business,
            isAuthenticated: true,
            isLoading: false,
            error: null
          })
        } catch (error: any) {
          set({
            error: error.message,
            isLoading: false
          })
        }
      },

      register: async (email: string, password: string, name: string) => {
        try {
          const { data: { session }, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                name
              }
            }
          })

          if (error) throw error

          const { data: user } = await supabase
            .from('users')
            .insert([
              {
                id: session?.user.id,
                email,
                name
              }
            ])
            .select()
            .single()

          set({
            user,
            session,
            isAuthenticated: true,
            isLoading: false,
            error: null
          })
        } catch (error: any) {
          set({
            error: error.message,
            isLoading: false
          })
        }
      },

      logout: async () => {
        try {
          await supabase.auth.signOut()
          set({
            user: null,
            session: null,
            business: null,
            isAuthenticated: false,
            isLoading: false,
            error: null
          })
        } catch (error: any) {
          set({
            error: error.message,
            isLoading: false
          })
        }
      }
    }),
    {
      name: 'auth-storage'
    }
  )
)
