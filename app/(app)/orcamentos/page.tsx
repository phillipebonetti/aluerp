import { PageHeader } from '@/components/ui/page-header'
import { EmptyState } from '@/components/ui/empty-state'
import { FileText } from 'lucide-react'

export default function OrcamentosPage() {
  return (
    <div className="p-6 max-w-screen-2xl mx-auto space-y-6">
      <PageHeader
        title="Orçamentos"
        description="Crie, envie e acompanhe orçamentos de esquadrias, vidros e instalações."
        action={{ label: 'Novo Orçamento' }}
      />
      <div className="bg-card border border-border rounded-xl">
        <EmptyState
          icon={FileText}
          title="Nenhum orçamento criado"
          description="Gere orçamentos profissionais com itens, metragens e valores de mão de obra."
          action={{ label: 'Criar Orçamento' }}
        />
      </div>
    </div>
  )
}
