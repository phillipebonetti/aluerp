'use client'

import { useMemo } from 'react'
import { DataTableAdvanced } from '@/components/ui/data-table-advanced'
import { Badge } from '@/components/ui/badge'
import type { CRMLead } from '@/src/modules/crm/types'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface LeadTableProps {
  leads: CRMLead[]
  onRowClick?: (lead: CRMLead) => void
  isLoading?: boolean
}

export function LeadTable({ leads, onRowClick, isLoading }: LeadTableProps) {
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
        header: 'Email',
        accessorKey: 'email'
      },
      {
        header: 'Empresa',
        accessorKey: 'company'
      },
      {
        header: 'Fonte',
        accessorKey: 'source',
        cell: ({ row }: any) => (
          <Badge variant="outline" className="text-xs">
            {row.original.source}
          </Badge>
        )
      },
      {
        header: 'Status',
        accessorKey: 'status',
        cell: ({ row }: any) => {
          const statusColors = {
            'novo': 'bg-blue-100 text-blue-800',
            'em_contato': 'bg-purple-100 text-purple-800',
            'interessado': 'bg-yellow-100 text-yellow-800',
            'proposta': 'bg-green-100 text-green-800',
            'perdido': 'bg-red-100 text-red-800'
          }
          return (
            <Badge className={statusColors[row.original.status as keyof typeof statusColors]}>
              {row.original.status}
            </Badge>
          )
        }
      },
      {
        header: 'Data',
        accessorKey: 'createdAt',
        cell: ({ row }: any) => format(new Date(row.original.createdAt), 'dd MMM yyyy', { locale: ptBR })
      }
    ],
    [onRowClick]
  )

  return (
    <DataTableAdvanced
      columns={columns}
      data={leads}
      searchKey="name"
      searchPlaceholder="Buscar leads..."
      isLoading={isLoading}
    />
  )
}
