'use client'

import { HardHat } from 'lucide-react'
import { EntityCrudPage } from '@/components/erp/entity-crud-page'

export default function ObrasPage() {
  return <EntityCrudPage title="Obras" description="Acompanhe o progresso, etapas e materiais de cada obra em execução." singular="Obra" endpoint="/api/obras" icon={HardHat} />
}
