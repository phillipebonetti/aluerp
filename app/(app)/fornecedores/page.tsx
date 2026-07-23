import { PageHeader } from '@/components/ui/page-header'
import { EmptyState } from '@/components/ui/empty-state'
import { Truck } from 'lucide-react'

export default function FornecedoresPage() {
  return (
    <div className="p-6 max-w-screen-2xl mx-auto space-y-6">
      <PageHeader
        title="Fornecedores"
        description="Gerencie fornecedores de alumínio, vidro, ferragens e demais insumos."
        action={{ label: 'Novo Fornecedor' }}
      />
      <div className="bg-card border border-border rounded-xl">
        <EmptyState
          icon={Truck}
          title="Nenhum fornecedor cadastrado"
          description="Cadastre seus fornecedores para controlar pedidos, preços e prazos de entrega."
          action={{ label: 'Cadastrar Fornecedor' }}
        />
      </div>
    </div>
  )
}
