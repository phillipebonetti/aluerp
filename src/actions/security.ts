'use server'

import { prisma } from '@/src/core/database'
import { createAuditLog, auditLogin } from '@/src/lib/audit-service'
import crypto from 'crypto'

/**
 * Validate password strength
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 */
export function validatePasswordStrength(password: string): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (password.length < 8) {
    errors.push('Senha deve ter no mínimo 8 caracteres')
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Senha deve conter pelo menos uma letra maiúscula')
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Senha deve conter pelo menos uma letra minúscula')
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Senha deve conter pelo menos um número')
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Senha deve conter pelo menos um caractere especial')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Check login attempts and enforce rate limiting
 * Block after 5 failed attempts for 15 minutes
 */
export async function checkLoginAttempts(email: string): Promise<{
  allowed: boolean
  attemptsLeft: number
  blockedUntil?: Date
}> {
  const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000)

  // Count failed attempts in last 15 minutes
  const failedAttempts = await prisma.loginAttempt.count({
    where: {
      email,
      success: false,
      createdAt: {
        gte: fifteenMinutesAgo,
      },
    },
  })

  const maxAttempts = 5
  const allowed = failedAttempts < maxAttempts

  return {
    allowed,
    attemptsLeft: Math.max(0, maxAttempts - failedAttempts),
    blockedUntil: allowed ? undefined : fifteenMinutesAgo,
  }
}

/**
 * Record login attempt
 */
export async function recordLoginAttempt(
  email: string,
  success: boolean,
  userId?: string,
  ipAddress?: string,
  browser?: string,
  reason?: string
) {
  return prisma.loginAttempt.create({
    data: {
      email,
      userId,
      success,
      ipAddress,
      browser,
      reason,
    },
  })
}

/**
 * Create password reset token
 */
export async function createPasswordResetToken(
  userId: string,
  expiresInMinutes = 30
) {
  // Generate secure token
  const token = crypto.randomBytes(32).toString('hex')
  const hashedToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex')

  const reset = await prisma.passwordReset.create({
    data: {
      userId,
      token: hashedToken,
      expiresAt: new Date(Date.now() + expiresInMinutes * 60 * 1000),
    },
  })

  return {
    ...reset,
    token, // Return unhashed token for sending to user
  }
}

/**
 * Validate password reset token
 */
export async function validatePasswordResetToken(token: string) {
  const hashedToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex')

  const reset = await prisma.passwordReset.findUnique({
    where: { token: hashedToken },
    include: { user: true },
  })

  if (!reset) {
    return { valid: false, error: 'Token inválido' }
  }

  if (reset.usedAt) {
    return { valid: false, error: 'Token já foi utilizado' }
  }

  if (reset.expiresAt < new Date()) {
    return { valid: false, error: 'Token expirado' }
  }

  return { valid: true, reset }
}

/**
 * Reset password with token
 */
export async function resetPasswordWithToken(
  token: string,
  newPassword: string
) {
  // Validate token
  const validation = await validatePasswordResetToken(token)
  if (!validation.valid) {
    return { success: false, error: validation.error }
  }

  // Validate password strength
  const strength = validatePasswordStrength(newPassword)
  if (!strength.valid) {
    return { success: false, error: 'Senha muito fraca', errors: strength.errors }
  }

  // Reset password (in real app, hash password and update user)
  const hashedToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex')

  const reset = await prisma.passwordReset.update({
    where: { token: hashedToken },
    data: { usedAt: new Date() },
  })

  // TODO: Update user password here

  await createAuditLog({
    userId: reset.userId,
    action: 'PASSWORD_RESET',
    resource: 'AUTH',
    resourceId: reset.userId,
  })

  return { success: true }
}

/**
 * Create user session
 */
export async function createUserSession(
  userId: string,
  companyId: string,
  deviceName?: string,
  browser?: string,
  operatingSystem?: string,
  ipAddress?: string,
  expiresInDays = 30
) {
  const session = await prisma.userSession.create({
    data: {
      userId,
      companyId,
      deviceName,
      browser,
      operatingSystem,
      ipAddress,
      expiresAt: new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000),
    },
  })

  await auditLogin(userId, ipAddress)

  return session
}

/**
 * Get active sessions for a user
 */
export async function getUserSessions(
  userId: string,
  companyId: string,
  excludeRevoked = true
) {
  return prisma.userSession.findMany({
    where: {
      userId,
      companyId,
      ...(excludeRevoked && { revokedAt: null }),
      expiresAt: {
        gt: new Date(), // Not expired
      },
    },
    orderBy: { lastActivityAt: 'desc' },
  })
}

/**
 * Revoke a session
 */
export async function revokeSession(sessionId: string, userId: string) {
  const session = await prisma.userSession.update({
    where: { id: sessionId },
    data: { revokedAt: new Date() },
  })

  await createAuditLog({
    userId,
    action: 'SESSION_REVOKE',
    resource: 'AUTH',
    resourceId: sessionId,
  })

  return session
}

/**
 * Revoke all sessions for a user (logout everywhere)
 */
export async function revokeAllSessions(userId: string, companyId: string) {
  await prisma.userSession.updateMany({
    where: {
      userId,
      companyId,
      revokedAt: null,
    },
    data: { revokedAt: new Date() },
  })

  await createAuditLog({
    userId,
    action: 'ALL_SESSIONS_REVOKE',
    resource: 'AUTH',
    resourceId: userId,
  })
}

/**
 * Update session last activity
 */
export async function updateSessionActivity(sessionId: string) {
  return prisma.userSession.update({
    where: { id: sessionId },
    data: { lastActivityAt: new Date() },
  })
}

/**
 * Clean up expired sessions
 */
export async function cleanupExpiredSessions() {
  const deleted = await prisma.userSession.deleteMany({
    where: {
      expiresAt: {
        lt: new Date(),
      },
    },
  })

  return deleted.count
}

/**
 * Clean up used password reset tokens
 */
export async function cleanupPasswordResetTokens() {
  const deleted = await prisma.passwordReset.deleteMany({
    where: {
      OR: [
        { expiresAt: { lt: new Date() } }, // Expired
        { usedAt: { not: null } }, // Already used
      ],
    },
  })

  return deleted.count
}
