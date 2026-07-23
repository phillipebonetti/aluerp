import { getSession } from '@/lib/auth'
import { AppLayout } from '@/components/layout/app-layout'

export default async function AppSectionLayout({ children }: { children: React.ReactNode }) {
  // getSession retorna null graciosamente se as env vars não estão configuradas
  const session = await getSession()

  return (
    <AppLayout user={session?.user} company={session?.company}>
      {children}
    </AppLayout>
  )
}
