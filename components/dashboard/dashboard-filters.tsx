'use client'

import { Button } from '@/components/ui/button'
import { Filter, Download, Share2, RotateCw } from 'lucide-react'
import { useState } from 'react'
import { DashboardFilters } from '@/src/hooks/useDashboardData'

interface DashboardFilterBarProps {
  filters: DashboardFilters
  onFilterChange: (filters: Partial<DashboardFilters>) => void
  onExport?: (format: 'pdf' | 'excel' | 'png') => void
  onPrint?: () => void
  onRefresh?: () => void
}

export function DashboardFilterBar({
  filters,
  onFilterChange,
  onExport,
  onPrint,
  onRefresh
}: DashboardFilterBarProps) {
  const [isOpen, setIsOpen] = useState(false)

  const periods = [
    { value: '30', label: 'Últimos 30 dias' },
    { value: '90', label: 'Últimos 90 dias' },
    { value: '180', label: 'Últimos 6 meses' },
    { value: '365', label: 'Últimos 12 meses' }
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsOpen(!isOpen)}
            className="gap-2"
          >
            <Filter className="w-4 h-4" />
            Período
          </Button>

          <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
            {periods.map(period => (
              <Button
                key={period.value}
                variant={filters.period === period.value ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onFilterChange({ period: period.value as any })}
                className="text-xs"
              >
                {period.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            className="gap-2"
          >
            <RotateCw className="w-4 h-4" />
            Atualizar
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onPrint}
            className="gap-2"
          >
            <Share2 className="w-4 h-4" />
            Imprimir
          </Button>

          <div className="relative group">
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="w-4 h-4" />
              Exportar
            </Button>
            <div className="absolute right-0 top-full mt-1 bg-white border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
              <button
                onClick={() => onExport?.('pdf')}
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
              >
                PDF
              </button>
              <button
                onClick={() => onExport?.('excel')}
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 border-t"
              >
                Excel
              </button>
              <button
                onClick={() => onExport?.('png')}
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 border-t"
              >
                PNG
              </button>
            </div>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="bg-gray-50 p-4 rounded-lg border space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-sm font-medium">Cliente</label>
              <select 
                className="mt-1 w-full border rounded px-2 py-1 text-sm"
                onChange={(e) => onFilterChange({ clientId: e.target.value })}
              >
                <option value="">Todos</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Fornecedor</label>
              <select 
                className="mt-1 w-full border rounded px-2 py-1 text-sm"
                onChange={(e) => onFilterChange({ supplierId: e.target.value })}
              >
                <option value="">Todos</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Status</label>
              <select 
                className="mt-1 w-full border rounded px-2 py-1 text-sm"
                onChange={(e) => onFilterChange({ status: e.target.value })}
              >
                <option value="">Todos</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
