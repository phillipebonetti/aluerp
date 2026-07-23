/**
 * Helpers de sessão para o AluERP.
 * Usa Supabase Auth como provedor de identidade.
 * O Prisma sincroniza o perfil do usuário e as associações de empresa.
 */
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

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
  try {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) return null

    // Busca perfil e empresa ativa (primeira membership encontrada)
    const member = await prisma.companyMember.findFirst({
      where: { userId: user.id },
      include: {
        user: true,
        company: true,
      },
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
    // Se as env vars não estão configuradas, retorna null graciosamente
    return null
  }
}

// ─────────────────────────────────────────────
// getSupabaseUser — apenas identidade, sem DB
// ─────────────────────────────────────────────

export async function getSupabaseUser() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    return user
  } catch {
    return null
  }
}
