import { Truck } from 'lucide-react'
import { EntityCrudPage } from '@/components/erp/entity-crud-page'

export default function FornecedoresPage() {
  return <EntityCrudPage title="Fornecedores" description="Gerencie fornecedores de alumínio, vidro, ferragens e demais insumos." singular="Fornecedor" endpoint="/api/fornecedores" icon={Truck} />
}
