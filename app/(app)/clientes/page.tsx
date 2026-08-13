import { Users } from 'lucide-react'
import { EntityCrudPage } from '@/components/erp/entity-crud-page'

export default function ClientesPage() {
  return <EntityCrudPage title="Clientes" description="Gerencie seus clientes, histórico de pedidos e informações de contato." singular="Cliente" endpoint="/api/clientes" icon={Users} />
}
