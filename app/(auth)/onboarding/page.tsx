import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getSupabaseUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { OnboardingForm } from '@/components/auth/onboarding-form'

export const metadata: Metadata = {
  title: 'Configurar empresa — AluERP',
}

export default async function OnboardingPage() {
  // Busca o usuário autenticado
  const supabaseUser = await getSupabaseUser()

  if (!supabaseUser) {
    redirect('/login')
  }

  // Se já tem empresa, vai direto pro dashboard
  const existingMember = await prisma.companyMember.findFirst({
    where: { userId: supabaseUser.id },
  }).catch(() => null)

  if (existingMember) {
    redirect('/dashboard')
  }

  // Busca o perfil para pegar o nome
  const profile = await prisma.user.findUnique({
    where: { id: supabaseUser.id },
    select: { name: true },
  }).catch(() => null)

  const userName = profile?.name ?? supabaseUser.email ?? 'Usuário'

  return <OnboardingForm userName={userName} />
}
