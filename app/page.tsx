import { redirect } from 'next/navigation'
import { getSession, hasIdentity } from '@/src/core/auth'

export default async function RootPage() {
  const session = await getSession()

  // Sessão completa (usuário + empresa) → dashboard
  if (session) redirect('/dashboard')

  // Autenticado mas sem empresa → onboarding
  if (await hasIdentity()) redirect('/onboarding')

  redirect('/login')
}
