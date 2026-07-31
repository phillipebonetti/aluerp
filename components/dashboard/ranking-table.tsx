'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency, formatPercentage } from '@/src/utils/dashboard'

interface RankingItem {
  id: string
  name: string
  value: number
  quantity?: number
  average?: number
  growth?: number
  percentage?: number
  loading?: boolean
}

interface RankingTableProps {
  items: RankingItem[]
  columns: Array<{
    key: string
    label: string
    format?: 'currency' | 'number' | 'percentage'
  }>
  loading?: boolean
}

export function RankingTable({ items, columns, loading }: RankingTableProps) {
  const formatValue = (value: number, format?: string) => {
    switch (format) {
      case 'currency':
        return formatCurrency(value)
      case 'percentage':
        return formatPercentage(value)
      default:
        return value.toLocaleString('pt-BR')
    }
  }

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead className="text-sm font-semibold">Posição</TableHead>
            {columns.map(col => (
              <TableHead key={col.key} className="text-sm font-semibold">
                {col.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item, index) => (
            <TableRow key={item.id} className="hover:bg-gray-50">
              <TableCell className="font-semibold text-gray-600">{index + 1}º</TableCell>
              <TableCell className="font-medium">{item.name}</TableCell>
              {columns.slice(1).map(col => (
                <TableCell key={col.key} className="text-right">
                  {formatValue((item as any)[col.key], col.format)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
