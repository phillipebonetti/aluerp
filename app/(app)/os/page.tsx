import { PageHeader } from '@/components/ui/page-header'
import { EmptyState } from '@/components/ui/empty-state'
import { ClipboardList } from 'lucide-react'

export default function OSPage() {
  return (
    <div className="p-6 max-w-screen-2xl mx-auto space-y-6">
      <PageHeader
        title="Ordens de Serviço"
        description="Controle todas as ordens de serviço, status de execução e equipes responsáveis."
        action={{ label: 'Nova OS' }}
      />
      <div className="bg-card border border-border rounded-xl">
        <EmptyState
          icon={ClipboardList}
          title="Nenhuma ordem de serviço aberta"
          description="Abra ordens de serviço a partir de orçamentos aprovados ou diretamente neste módulo."
          action={{ label: 'Abrir OS' }}
        />
      </div>
    </div>
  )
}
