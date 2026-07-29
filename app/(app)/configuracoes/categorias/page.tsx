import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { CategoriesTabs } from '@/components/financial/categories-tabs'

export const metadata = {
  title: 'Categorias Financeiras',
  description: 'Gerenciar categorias de receita e despesa',
}

export default async function CategoriasPage() {
  const session = await getSession()
  if (!session) {
    redirect('/login')
  }

  return (
    <main className="flex-1 space-y-4 p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Categorias Financeiras</h1>
        <p className="text-muted-foreground">Gerenciar categorias de receita e despesa</p>
      </div>

      <CategoriesTabs />
    </main>
  )
}
