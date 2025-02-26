import { createContext, useContext, ReactNode, FC } from 'react'
import { useAuth } from '@/hooks/useAuth'

interface AuthContextData {
  business: {
    id: string
    name: string
    owner_id: string
  } | null
  isLoading: boolean
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData)

export const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const auth = useAuth()
  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext(): AuthContextData {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return context
}
