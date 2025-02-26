/**
 * @fileoverview Configurações de autenticação e segurança
 */

export const AUTH_CONFIG = {
  // Configurações de sessão
  SESSION: {
    MAX_AGE: 7 * 24 * 60 * 60, // 7 dias em segundos
    REMEMBER_ME_MAX_AGE: 30 * 24 * 60 * 60, // 30 dias em segundos
    REFRESH_THRESHOLD: 24 * 60 * 60, // 24 horas em segundos
  },

  // Configurações de senha
  PASSWORD: {
    MIN_LENGTH: 8,
    REQUIRE_LOWERCASE: true,
    REQUIRE_UPPERCASE: true,
    REQUIRE_NUMBER: true,
    REQUIRE_SPECIAL_CHAR: true,
    MAX_LOGIN_ATTEMPTS: 5,
    LOCKOUT_TIME: 15 * 60, // 15 minutos em segundos
  },

  // Rotas protegidas
  PROTECTED_ROUTES: [
    '/dashboard',
    '/agenda',
    '/clientes',
    '/servicos',
    '/profissionais',
    '/financeiro',
    '/configuracoes',
  ],

  // Rotas públicas
  PUBLIC_ROUTES: [
    '/auth/login',
    '/auth/register',
    '/auth/forgot-password',
    '/auth/reset-password',
    '/terms',
    '/privacy',
  ],

  // Configurações de redirecionamento
  REDIRECT: {
    AFTER_LOGIN: '/dashboard',
    AFTER_LOGOUT: '/auth/login',
    AFTER_REGISTER: '/dashboard',
    UNAUTHORIZED: '/auth/login',
  },

  // Configurações de tokens
  TOKENS: {
    ACCESS_TOKEN_EXPIRY: '15m',
    REFRESH_TOKEN_EXPIRY: '7d',
    RESET_PASSWORD_EXPIRY: '1h',
  },

  // Configurações de rate limiting
  RATE_LIMIT: {
    MAX_REQUESTS: 100,
    WINDOW_MS: 15 * 60 * 1000, // 15 minutos
  },

  // Configurações de cookies
  COOKIES: {
    SECURE: process.env.NODE_ENV === 'production',
    SAME_SITE: 'lax' as const,
    HTTP_ONLY: true,
  },
}
