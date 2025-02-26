/**
 * @fileoverview Hook de autenticação com persistência de estado
 */

import { useEffect, useState, createContext, useContext, useCallback, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { auth, UserData, AuthenticationError } from '@/services/auth'
import { monitoring } from '@/services/monitoring'
import { useCache } from '@/hooks/useCache'
import { AUTH_CONFIG } from '@/config/auth'
import { toast } from 'sonner'

interface AuthState {
  user: UserData | null
  isLoading: boolean
  isAuthenticated: boolean
  error: Error | null
  lastActivity?: number
}

interface AuthContextData extends AuthState {
  signInWithGoogle: () => Promise<void>
  signInWithEmail: (email: string, password: string) => Promise<void>
  signUpWithEmail: (email: string, password: string, name: string) => Promise<void>
  signOut: () => Promise<void>
  clearError: () => void
  refreshSession: () => Promise<void>
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData)

const INITIAL_STATE: AuthState = {
  user: null,
  isLoading: true,
  isAuthenticated: false,
  error: null,
  lastActivity: Date.now(),
}

const SESSION_CACHE_KEY = 'auth_session'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [state, setState] = useState<AuthState>(INITIAL_STATE)
  const sessionCache = useCache<AuthState>({
    ttl: AUTH_CONFIG.SESSION.MAX_AGE * 1000,
  })
  const activityTimeoutRef = useRef<number>()

  // Função para atualizar o estado
  const updateState = useCallback((updates: Partial<AuthState>) => {
    setState((prev) => {
      const newState = { ...prev, ...updates, lastActivity: Date.now() }
      sessionCache.set(SESSION_CACHE_KEY, newState)
      return newState
    })
  }, [sessionCache])

  // Função para limpar erro
  const clearError = useCallback(() => {
    updateState({ error: null })
  }, [updateState])

  // Função para atualizar última atividade
  const updateActivity = useCallback(() => {
    updateState({ lastActivity: Date.now() })
  }, [updateState])

  // Função para verificar sessão expirada
  const checkSessionExpiration = useCallback(() => {
    const lastActivity = state.lastActivity || Date.now()
    const timeSinceLastActivity = Date.now() - lastActivity

    if (timeSinceLastActivity > AUTH_CONFIG.SESSION.MAX_AGE * 1000) {
      signOut()
      toast.error('Sessão expirada. Por favor, faça login novamente.')
    }
  }, [state.lastActivity])

  // Função para renovar sessão
  const refreshSession = useCallback(async () => {
    try {
      monitoring.markStart('session_refresh')
      const data = await auth.getSession()
      
      if (data?.user) {
        updateState({
          user: data.user,
          isAuthenticated: true,
          isLoading: false,
        })
        monitoring.trackUserAction('session_refreshed', data.user.id)
      }
    } catch (error) {
      console.error('Erro ao renovar sessão:', error)
      monitoring.trackError({
        level: 'error',
        message: 'Erro ao renovar sessão',
        error: error instanceof Error ? error : new Error('Erro desconhecido'),
      })
    } finally {
      monitoring.markEnd('session_refresh')
    }
  }, [updateState])

  // Verificar sessão ao montar
  useEffect(() => {
    let mounted = true
    monitoring.markStart('auth_session_check')

    async function checkUser() {
      try {
        // Tentar recuperar do cache primeiro
        const cachedSession = sessionCache.get(SESSION_CACHE_KEY)
        if (cachedSession && mounted) {
          setState(cachedSession)
          monitoring.trackUserAction('session_restored_from_cache', cachedSession.user?.id || '')
        }

        const data = await auth.getSession()
        if (mounted) {
          updateState({
            user: data?.user || null,
            isAuthenticated: !!data?.user,
            isLoading: false,
          })

          if (data?.user) {
            monitoring.trackUserAction('session_restored', data.user.id)
          }
        }
      } catch (error) {
        console.error('Erro ao verificar sessão:', error)
        if (mounted) {
          updateState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: error instanceof Error ? error : new Error('Erro ao verificar sessão'),
          })
          monitoring.trackError({
            level: 'error',
            message: 'Erro ao verificar sessão',
            error: error instanceof Error ? error : new Error('Erro desconhecido'),
          })
        }
      } finally {
        if (mounted) {
          monitoring.markEnd('auth_session_check')
        }
      }
    }

    checkUser()

    return () => {
      mounted = false
    }
  }, [updateState, sessionCache])

  // Monitorar atividade do usuário
  useEffect(() => {
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart']
    
    const handleActivity = () => {
      updateActivity()
      
      // Limpar timeout anterior
      if (activityTimeoutRef.current) {
        window.clearTimeout(activityTimeoutRef.current)
      }
      
      // Configurar novo timeout
      activityTimeoutRef.current = window.setTimeout(() => {
        checkSessionExpiration()
      }, AUTH_CONFIG.SESSION.REFRESH_THRESHOLD * 1000)
    }

    events.forEach(event => {
      window.addEventListener(event, handleActivity)
    })

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleActivity)
      })
      if (activityTimeoutRef.current) {
        window.clearTimeout(activityTimeoutRef.current)
      }
    }
  }, [updateActivity, checkSessionExpiration])

  // Observar mudanças no estado de autenticação
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      updateState({
        user,
        isAuthenticated: !!user,
        isLoading: false,
      })

      if (user) {
        monitoring.trackUserAction('auth_state_changed', user.id, {
          status: 'authenticated',
        })
      } else {
        monitoring.log({
          level: 'info',
          message: 'User logged out',
          context: { status: 'unauthenticated' },
        })
      }
    })

    return () => {
      unsubscribe()
    }
  }, [updateState])

  // Login com Google
  const signInWithGoogle = async () => {
    monitoring.markStart('google_sign_in')
    try {
      updateState({ isLoading: true, error: null })
      const { user } = await auth.signInWithGoogle()
      updateState({
        user,
        isAuthenticated: true,
        isLoading: false,
      })
      
      monitoring.trackUserAction('google_sign_in_success', user.id)
      toast.success('Login realizado com sucesso!')
      
      // Redirecionar para a página anterior ou dashboard
      const from = location.state?.from?.pathname || '/dashboard'
      navigate(from, { replace: true })
    } catch (error) {
      const authError = error instanceof AuthenticationError ? error : new Error('Erro ao fazer login com Google')
      console.error('Erro no login com Google:', error)
      updateState({
        isLoading: false,
        error: authError,
      })
      
      monitoring.trackError({
        level: 'error',
        message: 'Erro no login com Google',
        error: authError,
      })
      
      toast.error(authError.message)
    } finally {
      monitoring.markEnd('google_sign_in')
    }
  }

  // Login com email
  const signInWithEmail = async (email: string, password: string) => {
    monitoring.markStart('email_sign_in')
    try {
      updateState({ isLoading: true, error: null })
      const { user } = await auth.signInWithEmail(email, password)
      updateState({
        user,
        isAuthenticated: true,
        isLoading: false,
      })
      
      monitoring.trackUserAction('email_sign_in_success', user.id)
      toast.success('Login realizado com sucesso!')
      
      // Redirecionar para a página anterior ou dashboard
      const from = location.state?.from?.pathname || '/dashboard'
      navigate(from, { replace: true })
    } catch (error) {
      const authError = error instanceof AuthenticationError ? error : new Error('Email ou senha inválidos')
      console.error('Erro no login com email:', error)
      updateState({
        isLoading: false,
        error: authError,
      })
      
      monitoring.trackError({
        level: 'error',
        message: 'Erro no login com email',
        error: authError,
        context: { email },
      })
      
      toast.error(authError.message)
    } finally {
      monitoring.markEnd('email_sign_in')
    }
  }

  // Registro com email
  const signUpWithEmail = async (email: string, password: string, name: string) => {
    monitoring.markStart('email_sign_up')
    try {
      updateState({ isLoading: true, error: null })
      const { user } = await auth.signUpWithEmail(email, password, name)
      updateState({
        user,
        isAuthenticated: true,
        isLoading: false,
      })
      
      monitoring.trackUserAction('email_sign_up_success', user.id)
      toast.success('Conta criada com sucesso!')
      navigate('/dashboard', { replace: true })
    } catch (error) {
      const authError = error instanceof AuthenticationError ? error : new Error('Erro ao criar conta')
      console.error('Erro no registro:', error)
      updateState({
        isLoading: false,
        error: authError,
      })
      
      monitoring.trackError({
        level: 'error',
        message: 'Erro no registro com email',
        error: authError,
        context: { email, name },
      })
      
      toast.error(authError.message)
    } finally {
      monitoring.markEnd('email_sign_up')
    }
  }

  // Logout
  const signOut = async () => {
    monitoring.markStart('sign_out')
    try {
      updateState({ isLoading: true, error: null })
      const userId = state.user?.id
      await auth.signOut()
      updateState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      })
      
      if (userId) {
        monitoring.trackUserAction('sign_out_success', userId)
      }
      
      toast.success('Logout realizado com sucesso!')
      navigate('/auth/login', { replace: true })
    } catch (error) {
      const authError = error instanceof AuthenticationError ? error : new Error('Erro ao fazer logout')
      console.error('Erro ao fazer logout:', error)
      updateState({
        isLoading: false,
        error: authError,
      })
      
      monitoring.trackError({
        level: 'error',
        message: 'Erro no logout',
        error: authError,
      })
      
      toast.error(authError.message)
    } finally {
      monitoring.markEnd('sign_out')
    }
  }

  return (
    <AuthContext.Provider
      value={{
        ...state,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        signOut,
        clearError,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  return context
}
