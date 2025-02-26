import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { auth, AuthenticationError } from '../auth'
import { supabase } from '@/lib/supabase'
import { auth as firebaseAuth } from '@/lib/firebase'

// Mock das dependências
vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithIdToken: vi.fn(),
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      getSession: vi.fn(),
    },
    from: vi.fn(() => ({
      upsert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(),
        })),
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(),
        })),
      })),
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(),
        })),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(),
      })),
    })),
  },
}))

vi.mock('@/lib/firebase', () => ({
  auth: {
    signInWithPopup: vi.fn(),
    signOut: vi.fn(),
  },
}))

describe('Serviço de Autenticação', () => {
  const mockUser = {
    id: '123',
    email: 'test@example.com',
    name: 'Test User',
    created_at: new Date().toISOString(),
  }

  const mockSession = {
    user: { id: '123' },
    access_token: 'mock-token',
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('signInWithGoogle', () => {
    it('deve fazer login com sucesso usando Google', async () => {
      // Mock do Firebase
      vi.mocked(firebaseAuth.signInWithPopup).mockResolvedValueOnce({
        user: {
          uid: '123',
          email: 'test@example.com',
          displayName: 'Test User',
          photoURL: 'photo.jpg',
          getIdToken: vi.fn().mockResolvedValueOnce('mock-token'),
        },
      } as any)

      // Mock do Supabase
      vi.mocked(supabase.auth.signInWithIdToken).mockResolvedValueOnce({
        data: { session: mockSession },
        error: null,
      } as any)

      vi.mocked(supabase.from).mockReturnValueOnce({
        upsert: vi.fn().mockReturnValueOnce({
          select: vi.fn().mockReturnValueOnce({
            single: vi.fn().mockResolvedValueOnce({ data: mockUser }),
          }),
        }),
      } as any)

      const result = await auth.signInWithGoogle()

      expect(result).toEqual({
        user: mockUser,
        session: mockSession,
      })
    })

    it('deve lançar erro quando o login com Google falha', async () => {
      vi.mocked(firebaseAuth.signInWithPopup).mockRejectedValueOnce(
        new Error('Firebase error')
      )

      await expect(auth.signInWithGoogle()).rejects.toThrow(AuthenticationError)
    })
  })

  describe('signInWithEmail', () => {
    it('deve fazer login com sucesso usando email/senha', async () => {
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValueOnce({
        data: { session: mockSession },
        error: null,
      } as any)

      vi.mocked(supabase.from).mockReturnValueOnce({
        select: vi.fn().mockReturnValueOnce({
          eq: vi.fn().mockReturnValueOnce({
            single: vi.fn().mockResolvedValueOnce({ data: mockUser }),
          }),
        }),
      } as any)

      const result = await auth.signInWithEmail('test@example.com', 'password')

      expect(result).toEqual({
        user: mockUser,
        session: mockSession,
      })
    })

    it('deve lançar erro quando o login com email falha', async () => {
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValueOnce({
        data: { session: null },
        error: new Error('Invalid credentials'),
      } as any)

      await expect(
        auth.signInWithEmail('test@example.com', 'wrong-password')
      ).rejects.toThrow(AuthenticationError)
    })
  })

  describe('signUpWithEmail', () => {
    it('deve registrar um novo usuário com sucesso', async () => {
      vi.mocked(supabase.auth.signUp).mockResolvedValueOnce({
        data: { session: mockSession },
        error: null,
      } as any)

      vi.mocked(supabase.from).mockReturnValueOnce({
        insert: vi.fn().mockReturnValueOnce({
          select: vi.fn().mockReturnValueOnce({
            single: vi.fn().mockResolvedValueOnce({ data: mockUser }),
          }),
        }),
      } as any)

      const result = await auth.signUpWithEmail(
        'test@example.com',
        'password',
        'Test User'
      )

      expect(result).toEqual({
        user: mockUser,
        session: mockSession,
      })
    })

    it('deve lançar erro quando o registro falha', async () => {
      vi.mocked(supabase.auth.signUp).mockResolvedValueOnce({
        data: { session: null },
        error: new Error('Email already exists'),
      } as any)

      await expect(
        auth.signUpWithEmail('test@example.com', 'password', 'Test User')
      ).rejects.toThrow(AuthenticationError)
    })
  })

  describe('signOut', () => {
    it('deve fazer logout com sucesso', async () => {
      vi.mocked(firebaseAuth.signOut).mockResolvedValueOnce(undefined)
      vi.mocked(supabase.auth.signOut).mockResolvedValueOnce({
        error: null,
      } as any)

      await expect(auth.signOut()).resolves.not.toThrow()
    })

    it('deve lançar erro quando o logout falha', async () => {
      vi.mocked(firebaseAuth.signOut).mockRejectedValueOnce(
        new Error('Firebase error')
      )

      await expect(auth.signOut()).rejects.toThrow(AuthenticationError)
    })
  })

  describe('getSession', () => {
    it('deve recuperar a sessão atual com sucesso', async () => {
      vi.mocked(supabase.auth.getSession).mockResolvedValueOnce({
        data: { session: mockSession },
        error: null,
      } as any)

      vi.mocked(supabase.from).mockReturnValueOnce({
        select: vi.fn().mockReturnValueOnce({
          eq: vi.fn().mockReturnValueOnce({
            single: vi.fn().mockResolvedValueOnce({ data: mockUser }),
          }),
        }),
      } as any)

      const result = await auth.getSession()

      expect(result).toEqual({
        user: mockUser,
        session: mockSession,
      })
    })

    it('deve retornar null quando não há sessão', async () => {
      vi.mocked(supabase.auth.getSession).mockResolvedValueOnce({
        data: { session: null },
        error: null,
      } as any)

      const result = await auth.getSession()

      expect(result).toBeNull()
    })
  })
})
