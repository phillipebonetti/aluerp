'use client'

import { useMemo } from 'react'
import { DataTableAdvanced } from '@/components/ui/data-table-advanced'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, STAGE_LABELS } from '@/lib/crm/utils'
import type { CRMOpportunity } from '@/src/modules/crm/types'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface OpportunityTableProps {
  opportunities: CRMOpportunity[]
  onRowClick?: (opportunity: CRMOpportunity) => void
  isLoading?: boolean
}

export function OpportunityTable({ opportunities, onRowClick, isLoading }: OpportunityTableProps) {
  const columns = useMemo(
    () => [
      {
        header: 'Nome',
        accessorKey: 'name',
        cell: ({ row }: any) => (
          <button
            onClick={() => onRowClick?.(row.original)}
            className="text-blue-600 hover:underline font-medium"
          >
            {row.original.name}
          </button>
        )
      },
      {
        header: 'Estágio',
        accessorKey: 'stage',
        cell: ({ row }: any) => (
          <Badge variant="outline" className="text-xs">
            {STAGE_LABELS[row.original.stage]}
          </Badge>
        )
      },
      {
        header: 'Valor',
        accessorKey: 'value',
        cell: ({ row }: any) => formatCurrency(row.original.value)
      },
      {
        header: 'Probabilidade',
        accessorKey: 'probability',
        cell: ({ row }: any) => (
          <div className="flex items-center gap-2">
            <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500"
                style={{ width: `${row.original.probability}%` }}
              />
            </div>
            <span className="text-xs font-medium">{row.original.probability}%</span>
          </div>
        )
      },
      {
        header: 'Prazo',
        accessorKey: 'expectedCloseDate',
        cell: ({ row }: any) => format(new Date(row.original.expectedCloseDate), 'dd MMM yyyy', { locale: ptBR })
      }
    ],
    [onRowClick]
  )

  return (
    <DataTableAdvanced
      columns={columns}
      data={opportunities}
      searchKey="name"
      searchPlaceholder="Buscar oportunidades..."
      isLoading={isLoading}
    />
  )
}
