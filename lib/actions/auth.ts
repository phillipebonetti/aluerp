'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

// ─────────────────────────────────────────────
// Login
// ─────────────────────────────────────────────

export async function loginAction(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Preencha todos os campos.' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { error: 'E-mail ou senha inválidos.' }
  }

  redirect('/dashboard')
}

// ─────────────────────────────────────────────
// Registro
// ─────────────────────────────────────────────

export async function registerAction(formData: FormData) {
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!name || !email || !password) {
    return { error: 'Preencha todos os campos.' }
  }

  if (password.length < 6) {
    return { error: 'A senha deve ter pelo menos 6 caracteres.' }
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signUp({ email, password })

  if (error) {
    return { error: error.message }
  }

  if (!data.user) {
    return { error: 'Erro ao criar conta. Tente novamente.' }
  }

  // Cria o perfil do usuário no banco via Prisma
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

export async function createCompanyAction(formData: FormData) {
  const name = formData.get('name') as string
  const cnpj = (formData.get('cnpj') as string) || undefined
  const phone = (formData.get('phone') as string) || undefined
  const email = (formData.get('email') as string) || undefined

  if (!name) {
    return { error: 'O nome da empresa é obrigatório.' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Sessão expirada. Faça login novamente.' }
  }

  // Cria empresa e vincula o usuário como OWNER
  const company = await prisma.company.create({
    data: {
      name,
      cnpj,
      phone,
      email,
      members: {
        create: {
          userId: user.id,
          role: 'OWNER',
        },
      },
    },
  })

  if (!company) {
    return { error: 'Erro ao criar empresa. Tente novamente.' }
  }

  redirect('/dashboard')
}

// ─────────────────────────────────────────────
// Logout
// ─────────────────────────────────────────────

export async function logoutAction() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
