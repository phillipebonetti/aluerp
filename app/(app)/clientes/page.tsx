import { PageHeader } from '@/components/ui/page-header'
import { EmptyState } from '@/components/ui/empty-state'
import { Users } from 'lucide-react'

export default function ClientesPage() {
  return (
    <div className="p-6 max-w-screen-2xl mx-auto space-y-6">
      <PageHeader
        title="Clientes"
        description="Gerencie seus clientes, histórico de pedidos e informações de contato."
        action={{ label: 'Novo Cliente' }}
      />
      <div className="bg-card border border-border rounded-xl">
        <EmptyState
          icon={Users}
          title="Nenhum cliente cadastrado"
          description="Adicione clientes para centralizar informações, obras e histórico de orçamentos."
          action={{ label: 'Cadastrar Cliente' }}
        />
      </div>
    </div>
  )
}
