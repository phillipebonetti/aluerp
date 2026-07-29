'use server'

import { redirect } from 'next/navigation'
import { createServerClient as createClient } from '@/src/core/supabase'
import { getPrisma } from '@/src/core/database'
import { isPreviewMode } from '@/src/core/config'
import {
  setPreviewSession,
  getPreviewSessionUserId,
  clearPreviewSession,
} from '@/src/core/auth'
import {
  findUserByEmail,
  createUser,
  createCompany,
  findMembershipByUserId,
} from '@/src/core/auth'

export interface ActionResult {
  error?: string
}

// ─────────────────────────────────────────────
// Login
// ─────────────────────────────────────────────

export async function loginAction(formData: FormData): Promise<ActionResult> {
  const email = (formData.get('email') as string)?.trim()
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Preencha todos os campos.' }
  }

  if (isPreviewMode) {
    const user = findUserByEmail(email)
    if (!user || user.password !== password) {
      return { error: 'E-mail ou senha inválidos.' }
    }

    await setPreviewSession(user.id)

    // Se ainda não tem empresa, vai para o onboarding
    const membership = findMembershipByUserId(user.id)
    redirect(membership ? '/dashboard' : '/onboarding')
  }

  const supabase = await createClient()
  if (!supabase) {
    return { error: 'Serviço de autenticação indisponível.' }
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { error: 'E-mail ou senha inválidos.' }
  }

  redirect('/dashboard')
}

// ─────────────────────────────────────────────
// Registro
// ─────────────────────────────────────────────

export async function registerAction(formData: FormData): Promise<ActionResult> {
  const name = (formData.get('name') as string)?.trim()
  const email = (formData.get('email') as string)?.trim()
  const password = formData.get('password') as string

  if (!name || !email || !password) {
    return { error: 'Preencha todos os campos.' }
  }

  if (password.length < 6) {
    return { error: 'A senha deve ter pelo menos 6 caracteres.' }
  }

  if (isPreviewMode) {
    if (findUserByEmail(email)) {
      return { error: 'Este e-mail já está cadastrado.' }
    }

    const user = createUser({ name, email, password })
    await setPreviewSession(user.id)
    redirect('/onboarding')
  }

  const supabase = await createClient()
  if (!supabase) {
    return { error: 'Serviço de autenticação indisponível.' }
  }

  const { data, error } = await supabase.auth.signUp({ email, password })

  if (error) {
    return { error: error.message }
  }

  if (!data.user) {
    return { error: 'Erro ao criar conta. Tente novamente.' }
  }

  // Cria o perfil do usuário no banco via Prisma
  const prisma = await getPrisma()
  if (!prisma) {
    return { error: 'Banco de dados indisponível. Tente novamente.' }
  }

  await prisma.user.upsert({
    where: { id: data.user.id },
    create: { id: data.user.id, name, email },
    update: { name },
  })

  redirect('/onboarding')
}

// ─────────────────────────────────────────────
// Onboarding — criar empresa
// ─────────────────────────────────────────────

export async function createCompanyAction(
  formData: FormData
): Promise<ActionResult> {
  const name = (formData.get('name') as string)?.trim()
  const cnpj = ((formData.get('cnpj') as string) || '').trim() || undefined
  const phone = ((formData.get('phone') as string) || '').trim() || undefined
  const email = ((formData.get('email') as string) || '').trim() || undefined

  if (!name) {
    return { error: 'O nome da empresa é obrigatório.' }
  }

  if (isPreviewMode) {
    const userId = await getPreviewSessionUserId()
    if (!userId) {
      return { error: 'Sessão expirada. Faça login novamente.' }
    }

    createCompany({ name, cnpj, phone, email, ownerId: userId })
    redirect('/dashboard')
  }

  const supabase = await createClient()
  if (!supabase) {
    return { error: 'Serviço de autenticação indisponível.' }
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Sessão expirada. Faça login novamente.' }
  }

  const prisma = await getPrisma()
  if (!prisma) {
    return { error: 'Banco de dados indisponível. Tente novamente.' }
  }

  // Cria empresa e vincula o usuário como OWNER
  await prisma.company.create({
    data: {
      name,
      cnpj,
      phone,
      email,
      members: {
        create: { userId: user.id, role: 'OWNER' },
      },
    },
  })

  redirect('/dashboard')
}

// ─────────────────────────────────────────────
// Logout
// ─────────────────────────────────────────────

export async function logoutAction() {
  if (isPreviewMode) {
    await clearPreviewSession()
    redirect('/login')
  }

  const supabase = await createClient()
  if (supabase) {
    await supabase.auth.signOut()
  }
  redirect('/login')
}
