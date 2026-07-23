import { redirect } from 'next/navigation'
import { getSupabaseUser } from '@/lib/auth'

export default async function RootPage() {
  // Se não há env vars configuradas, getSupabaseUser retorna null → vai para /login
  const user = await getSupabaseUser()

  if (user) {
    redirect('/dashboard')
  } else {
    redirect('/login')
  }
}
