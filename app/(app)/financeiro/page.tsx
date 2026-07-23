import { PageHeader } from '@/components/ui/page-header'
import { EmptyState } from '@/components/ui/empty-state'
import { Banknote } from 'lucide-react'

export default function FinanceiroPage() {
  return (
    <div className="p-6 max-w-screen-2xl mx-auto space-y-6">
      <PageHeader
        title="Financeiro"
        description="Controle completo das entradas, saídas e fluxo de caixa da empresa."
        action={{ label: 'Nova Transação' }}
      />
      <div className="bg-card border border-border rounded-xl">
        <EmptyState
          icon={Banknote}
          title="Nenhuma transação registrada"
          description="Comece registrando entradas e saídas financeiras para visualizar seu fluxo de caixa."
          action={{ label: 'Adicionar Transação' }}
        />
      </div>
    </div>
  )
}
