import { PageHeader } from '@/components/ui/page-header'
import { EmptyState } from '@/components/ui/empty-state'
import { HardHat } from 'lucide-react'

export default function ObrasPage() {
  return (
    <div className="p-6 max-w-screen-2xl mx-auto space-y-6">
      <PageHeader
        title="Obras"
        description="Acompanhe o progresso, etapas e materiais de cada obra em execução."
        action={{ label: 'Nova Obra' }}
      />
      <div className="bg-card border border-border rounded-xl">
        <EmptyState
          icon={HardHat}
          title="Nenhuma obra cadastrada"
          description="Cadastre suas obras para acompanhar o progresso, equipes e materiais utilizados."
          action={{ label: 'Cadastrar Obra' }}
        />
      </div>
    </div>
  )
}
