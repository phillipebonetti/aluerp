/**
 * Helpers de Autenticação
 * 
 * Funções reutilizáveis para autenticação, validação de sessão,
 * proteção de rotas e verificação de permissões
 */

import type { AppSession, SessionUser } from '@/src/core/auth'

/**
 * Valida se sessão está ativa
 */
export function isSessionValid(session: AppSession | null | undefined): boolean {
  if (!session?.user) {
    return false
  }

  if (session.expiresAt) {
    return new Date(session.expiresAt) > new Date()
  }

  return true
}

/**
 * Extrai informações do usuário da sessão
 */
export function getUserFromSession(session: AppSession | null | undefined): SessionUser | null {
  if (!isSessionValid(session)) {
    return null
  }

  return session?.user || null
}

/**
 * Valida se usuário é proprietário
 */
export function isOwner(session: AppSession | null | undefined): boolean {
  const user = getUserFromSession(session)
  return user?.role === 'OWNER'
}

/**
 * Valida se usuário é admin
 */
export function isAdmin(session: AppSession | null | undefined): boolean {
  const user = getUserFromSession(session)
  return user?.role === 'OWNER' || user?.role === 'ADMIN'
}

/**
 * Valida se tem permissão específica
 */
export function hasPermission(
  session: AppSession | null | undefined,
  permission: string
): boolean {
  const user = getUserFromSession(session)
  if (!user?.permissions) {
    return false
  }

  return user.permissions.includes(permission)
}

/**
 * Valida se tem alguma das permissões
 */
export function hasAnyPermission(
  session: AppSession | null | undefined,
  permissions: string[]
): boolean {
  const user = getUserFromSession(session)
  if (!user?.permissions) {
    return false
  }

  return permissions.some(p => user.permissions?.includes(p))
}

/**
 * Valida se tem todas as permissões
 */
export function hasAllPermissions(
  session: AppSession | null | undefined,
  permissions: string[]
): boolean {
  const user = getUserFromSession(session)
  if (!user?.permissions) {
    return false
  }

  return permissions.every(p => user.permissions?.includes(p))
}

/**
 * Obtém informações da empresa da sessão
 */
export function getCompanyFromSession(session: AppSession | null | undefined) {
  if (!isSessionValid(session)) {
    return null
  }

  return session?.company || null
}

/**
 * Valida se usuário pertence à empresa
 */
export function belongsToCompany(
  session: AppSession | null | undefined,
  companyId: string
): boolean {
  const company = getCompanyFromSession(session)
  return company?.id === companyId
}

/**
 * Cria header de autenticação
 */
export function createAuthHeader(token: string): Record<string, string> {
  return {
    Authorization: `Bearer ${token}`,
  }
}

/**
 * Extrai token de header
 */
export function extractTokenFromHeader(authHeader: string): string | null {
  if (!authHeader.startsWith('Bearer ')) {
    return null
  }

  return authHeader.slice(7)
}

/**
 * Valida força de senha
 */
export function validatePasswordStrength(password: string): {
  score: number
  feedback: string[]
} {
  const feedback: string[] = []
  let score = 0

  if (password.length >= 8) score += 1
  else feedback.push('Mínimo 8 caracteres')

  if (/[a-z]/.test(password)) score += 1
  else feedback.push('Adicione letras minúsculas')

  if (/[A-Z]/.test(password)) score += 1
  else feedback.push('Adicione letras maiúsculas')

  if (/\d/.test(password)) score += 1
  else feedback.push('Adicione números')

  if (/[!@#$%^&*]/.test(password)) score += 1
  else feedback.push('Adicione caracteres especiais')

  return { score, feedback }
}

/**
 * Gera token seguro
 */
export function generateSecureToken(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let token = ''

  for (let i = 0; i < length; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length))
  }

  return token
}

/**
 * Valida redirect URL (previne open redirect)
 */
export function isValidRedirectUrl(url: string): boolean {
  try {
    const parsed = new URL(url, 'http://localhost')
    const origin = new URL('http://localhost')

    // Apenas permite URLs relativas ou do mesmo domínio
    return parsed.origin === origin.origin || url.startsWith('/')
  } catch {
    return false
  }
}

/**
 * Rate limit simples em memória (para uso local)
 */
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

export function checkRateLimit(
  identifier: string,
  maxAttempts: number = 5,
  windowMs: number = 60000
): boolean {
  const now = Date.now()
  const record = rateLimitMap.get(identifier)

  if (!record || record.resetTime < now) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + windowMs })
    return true
  }

  if (record.count < maxAttempts) {
    record.count++
    return true
  }

  return false
}

/**
 * Limpa rate limit para identifier
 */
export function clearRateLimit(identifier: string): void {
  rateLimitMap.delete(identifier)
}
