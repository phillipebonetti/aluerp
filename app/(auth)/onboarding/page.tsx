import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getCurrentUser, getSession } from '@/lib/auth'
import { OnboardingForm } from '@/components/auth/onboarding-form'

export const metadata: Metadata = {
  title: 'Configurar empresa — AluERP',
}

export default async function OnboardingPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  // Se já tem empresa vinculada, vai direto pro dashboard
  const session = await getSession()
  if (session) {
    redirect('/dashboard')
  }

  return <OnboardingForm userName={user.name} />
}
