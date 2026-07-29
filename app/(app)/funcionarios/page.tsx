import { getSession } from '@/src/core/auth'
import { redirect } from 'next/navigation'
import { EmployeeList } from '@/components/employee/employee-list'

export const metadata = {
  title: 'Funcionários',
  description: 'Gerenciar funcionários e comissões',
}

export default async function FuncionariosPage() {
  const session = await getSession()
  if (!session) {
    redirect('/login')
  }

  return (
    <main className="flex-1 space-y-4 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Funcionários</h1>
          <p className="text-muted-foreground">Gerenciar equipe de vendas e comissões</p>
        </div>
      </div>

      <EmployeeList />
    </main>
  )
}
