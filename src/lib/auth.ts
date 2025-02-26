import { supabase } from './supabase'
import { monitoring } from './monitoring'
import type { User, Business } from './types/supabase'

export class AuthenticationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AuthenticationError'
  }
}

export class Auth {
  async signInWithEmail(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw new AuthenticationError(error.message)
      if (!data.user) throw new AuthenticationError('Usuário não encontrado')

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single()

      if (userError) throw new AuthenticationError(userError.message)
      if (!userData) throw new AuthenticationError('Usuário não encontrado')

      return {
        user: userData as User,
        session: data.session
      }
    } catch (error) {
      if (error instanceof AuthenticationError) throw error
      throw new AuthenticationError('Erro ao fazer login')
    }
  }

  async signUpWithEmail(email: string, password: string, name: string) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      })

      if (error) throw new AuthenticationError(error.message)
      if (!data.user) throw new AuthenticationError('Erro ao criar usuário')

      // Criar negócio
      const { data: business, error: businessError } = await supabase
        .from('businesses')
        .insert({
          name: `${name}'s Business`,
          owner_id: data.user.id,
          settings: {
            theme: {
              mode: 'light',
              primaryColor: '#0066FF',
              fontSize: 'medium',
              animations: true
            },
            notifications: {
              email: true,
              push: true,
              sms: false
            },
            scheduling: {
              allowClientScheduling: true,
              requirePayment: false,
              reminderTime: 24
            }
          }
        })
        .select()
        .single()

      if (businessError) throw new AuthenticationError(businessError.message)
      if (!business) throw new AuthenticationError('Erro ao criar negócio')

      // Criar usuário
      const { data: user, error: userError } = await supabase
        .from('users')
        .insert({
          id: data.user.id,
          email,
          name,
          business_id: business.id
        })
        .select()
        .single()

      if (userError) throw new AuthenticationError(userError.message)
      if (!user) throw new AuthenticationError('Erro ao criar usuário')

      return {
        user: user as User,
        business: business as Business
      }
    } catch (error) {
      if (error instanceof AuthenticationError) throw error
      throw new AuthenticationError('Erro ao criar conta')
    }
  }

  async signOut() {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw new AuthenticationError(error.message)
    } catch (error) {
      if (error instanceof AuthenticationError) throw error
      throw new AuthenticationError('Erro ao fazer logout')
    }
  }

  async getSession() {
    try {
      const { data, error } = await supabase.auth.getSession()
      if (error) throw new AuthenticationError(error.message)
      return data.session
    } catch (error) {
      if (error instanceof AuthenticationError) throw error
      throw new AuthenticationError('Erro ao recuperar sessão')
    }
  }

  async getUser() {
    try {
      const { data, error } = await supabase.auth.getUser()
      if (error) throw new AuthenticationError(error.message)
      if (!data.user) return null

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single()

      if (userError) throw new AuthenticationError(userError.message)
      if (!userData) return null

      return userData as User
    } catch (error) {
      if (error instanceof AuthenticationError) throw error
      throw new AuthenticationError('Erro ao recuperar usuário')
    }
  }

  async getBusiness(businessId: string) {
    try {
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('id', businessId)
        .single()

      if (error) throw new AuthenticationError(error.message)
      if (!data) return null

      return data as Business
    } catch (error) {
      if (error instanceof AuthenticationError) throw error
      throw new AuthenticationError('Erro ao recuperar negócio')
    }
  }
}

export const auth = new Auth()
