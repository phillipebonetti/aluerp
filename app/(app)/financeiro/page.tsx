import { PageHeader } from '@/components/ui/page-header'
import { TransactionList } from '@/components/transaction/transaction-list'

export default function FinanceiroPage() {
  return (
    <div className="p-6 max-w-screen-2xl mx-auto space-y-6">
      <PageHeader
        title="Financeiro"
        description="Controle completo das entradas, saídas e fluxo de caixa da empresa."
      />
      <TransactionList />
    </div>
  )
}
