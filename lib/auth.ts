/**
 * Helpers de sessão para o AluERP.
 *
 * Opera em dois modos (ver lib/env.ts):
 * - PRODUCTION: Supabase Auth como identidade + Prisma para perfil/empresa.
 * - PREVIEW: cookie de sessão + store em memória.
 *
 * Ambos retornam o mesmo `AppSession`, então nenhum componente de UI
 * precisa saber qual modo está ativo.
 */
import { createServerClient as createClient } from '@/src/core/supabase'
import { getPrisma } from '@/src/core/database'
import { isPreviewMode } from '@/src/core/config'
import { getPreviewSessionUserId } from '@/src/core/auth/preview/session'
import { findMembershipByUserId, findUserById } from '@/src/core/auth/preview/store'

// ─────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────

export interface SessionUser {
  id: string
  name: string
  email: string
  avatar: string | null
}

export interface SessionCompany {
  id: string
  name: string
  logo: string | null
  plan: string
  role: string
}

export interface AppSession {
  user: SessionUser
  company: SessionCompany
}

// ─────────────────────────────────────────────
// getSession — Server Component / Route Handler
// Retorna null se não há sessão válida
// ─────────────────────────────────────────────

export async function getSession(): Promise<AppSession | null> {
  if (isPreviewMode) {
    const userId = await getPreviewSessionUserId()
    if (!userId) return null

    const member = findMembershipByUserId(userId)
    if (!member) return null

    return {
      user: {
        id: member.user.id,
        name: member.user.name,
        email: member.user.email,
        avatar: member.user.avatar,
      },
      company: {
        id: member.company.id,
        name: member.company.name,
        logo: member.company.logo,
        plan: member.company.plan,
        role: member.role,
      },
    }
  }

  try {
    const supabase = await createClient()
    if (!supabase) return null

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error || !user) return null

    const prisma = await getPrisma()
    if (!prisma) return null

    // Busca perfil e empresa ativa (primeira membership encontrada)
    const member = await prisma.companyMember.findFirst({
      where: { userId: user.id },
      include: { user: true, company: true },
      orderBy: { createdAt: 'asc' },
    })

    if (!member) return null

    return {
      user: {
        id: member.user.id,
        name: member.user.name,
        email: member.user.email,
        avatar: member.user.avatar,
      },
      company: {
        id: member.company.id,
        name: member.company.name,
        logo: member.company.logo,
        plan: member.company.plan,
        role: member.role,
      },
    }
  } catch {
    return null
  }
}

// ─────────────────────────────────────────────
// getCurrentUser — apenas identidade, sem empresa
// Usado por /onboarding, que roda antes de existir empresa
// ─────────────────────────────────────────────

export async function getCurrentUser(): Promise<SessionUser | null> {
  if (isPreviewMode) {
    const userId = await getPreviewSessionUserId()
    if (!userId) return null

    const user = findUserById(userId)
    if (!user) return null

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
    }
  }

  try {
    const supabase = await createClient()
    if (!supabase) return null

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return null

    const prisma = await getPrisma()
    const profile = prisma
      ? await prisma.user.findUnique({ where: { id: user.id } })
      : null

    return {
      id: user.id,
      name: profile?.name ?? user.email ?? 'Usuário',
      email: profile?.email ?? user.email ?? '',
      avatar: profile?.avatar ?? null,
    }
  } catch {
    return null
  }
}

/** true se existe identidade autenticada (mesmo sem empresa vinculada). */
export async function hasIdentity(): Promise<boolean> {
  return (await getCurrentUser()) !== null
}
