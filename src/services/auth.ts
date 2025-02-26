/**
 * @fileoverview Serviço de autenticação com Firebase e Supabase
 */

import { auth as firebaseAuth } from '@/lib/firebase'
import { supabase } from '@/lib/supabase'
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from 'firebase/auth'
import { AuthError } from '@supabase/supabase-js'
import type { User } from '@/lib/types/database'

// Tipos
export interface UserData {
  id: string
  email: string
  name: string
  avatar_url?: string
  subscription_status?: 'active' | 'trialing' | 'canceled' | 'expired'
  subscription_end?: string
  created_at: string
  updated_at?: string
  last_sign_in?: string
}

// Erros customizados
export class AuthenticationError extends Error {
  status: string

  constructor(message: string, status: string) {
    super(message)
    this.name = 'AuthenticationError'
    this.status = status
  }
}

// Provedor do Google
const googleProvider = new GoogleAuthProvider()
googleProvider.setCustomParameters({
  prompt: 'select_account',
  access_type: 'offline',
})

// Funções auxiliares
const handleAuthError = (error: unknown) => {
  if (error instanceof AuthError) {
    throw new AuthenticationError(error.message, error.status.toString())
  }
  if (error instanceof Error) {
    throw new AuthenticationError(error.message, '400')
  }
  throw new AuthenticationError('Erro desconhecido na autenticação', '400')
}

const updateUserLastSignIn = async (userId: string) => {
  try {
    const { error } = await supabase
      .from('users')
      .update({
        last_sign_in: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)

    if (error) {
      throw error
    }
  } catch (error: any) {
    throw new AuthenticationError(error.message, error.status?.toString() || '400')
  }
}

// Funções de autenticação
export const auth = {
  // Login com Google
  async signInWithGoogle() {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (error) {
        throw new AuthenticationError(error.message, error.status?.toString() || '400')
      }

      return data
    } catch (error: any) {
      throw new AuthenticationError(error.message, error.status?.toString() || '400')
    }
  },

  // Login com email/senha
  async signInWithEmail(email: string, password: string) {
    try {
      const { data: { session }, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single()

      if (userError) throw userError

      await updateUserLastSignIn(session.user.id)

      return {
        user: userData as UserData,
        session,
      }
    } catch (error) {
      console.error('Erro no login com email:', error)
      handleAuthError(error)
    }
  },

  // Registro com email/senha
  async signUpWithEmail(email: string, password: string, name: string) {
    try {
      const { data: { session }, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      })

      if (error) throw error

      // Criar usuário no banco
      const { data: userData, error: userError } = await supabase
        .from('users')
        .insert({
          id: session?.user.id,
          email,
          name,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          last_sign_in: new Date().toISOString(),
        })
        .select()
        .single()

      if (userError) throw userError

      return {
        user: userData as UserData,
        session,
      }
    } catch (error) {
      console.error('Erro no registro:', error)
      handleAuthError(error)
    }
  },

  // Logout
  async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) {
      throw new AuthenticationError(error.message, error.status?.toString() || '400')
    }
  },

  // Recuperar sessão atual
  async getSession() {
    try {
      const { data: session } = await supabase.auth.getSession()

      if (!session?.user) {
        return null
      }

      const { data: userData, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single()

      if (error) {
        throw error
      }

      if (userData) {
        await updateUserLastSignIn(session.user.id)
      }

      return {
        user: userData as UserData,
        session,
      }
    } catch (error: any) {
      throw new AuthenticationError(error.message, error.status?.toString() || '400')
    }
  },

  // Observar mudanças no estado de autenticação
  onAuthStateChanged(callback: (user: UserData | null) => void) {
    let unsubscribe: (() => void) | null = null

    try {
      unsubscribe = onAuthStateChanged(firebaseAuth, async (firebaseUser) => {
        if (!firebaseUser) {
          callback(null)
          return
        }

        try {
          const { data: userData } = await supabase
            .from('users')
            .select('*')
            .eq('id', firebaseUser.uid)
            .single()

          callback(userData as UserData)
        } catch (error) {
          console.error('Erro ao recuperar dados do usuário:', error)
          callback(null)
        }
      })

      return () => {
        if (unsubscribe) {
          unsubscribe()
        }
      }
    } catch (error) {
      console.error('Erro ao observar estado de autenticação:', error)
      return () => {}
    }
  },

  async createUserProfile(firebaseUser: any) {
    try {
      const { data: existingUser } = await supabase
        .from('users')
        .select('*')
        .eq('id', firebaseUser.uid)
        .single()

      if (existingUser) {
        return existingUser
      }

      const { data: newUser, error } = await supabase
        .from('users')
        .insert({
          id: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0],
          avatar_url: firebaseUser.photoURL,
          role: 'user',
          active: true
        })
        .select()
        .single()

      if (error) {
        throw error
      }

      return newUser
    } catch (error: any) {
      throw new AuthenticationError(error.message, error.status?.toString() || '400')
    }
  },

  async updateUserLastSignIn(userId: string) {
    try {
      const { error } = await supabase
        .from('users')
        .update({
          last_sign_in: new Date().toISOString()
        })
        .eq('id', userId)

      if (error) {
        throw error
      }
    } catch (error: any) {
      throw new AuthenticationError(error.message, error.status?.toString() || '400')
    }
  }
}
