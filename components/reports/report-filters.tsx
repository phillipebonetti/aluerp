'use client'

import { Button } from '@/components/ui/button'
import { Calendar, Filter } from 'lucide-react'
import { useState } from 'react'

interface ReportFiltersProps {
  onApply?: (filters: any) => void
}

export function ReportFilters({ onApply }: ReportFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="flex gap-2 items-center">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="gap-2"
      >
        <Filter className="w-4 h-4" />
        Filtros
      </Button>
      <Button variant="outline" size="sm" className="gap-2">
        <Calendar className="w-4 h-4" />
        Período
      </Button>
      {isOpen && (
        <div className="absolute top-12 left-0 bg-white border rounded-lg p-4 shadow-lg z-10 w-80">
          <div className="space-y-4">
            <label className="block">
              <span className="text-sm font-medium">Cliente</span>
              <select className="mt-1 w-full border rounded px-2 py-1 text-sm" />
            </label>
            <label className="block">
              <span className="text-sm font-medium">Vendedor</span>
              <select className="mt-1 w-full border rounded px-2 py-1 text-sm" />
            </label>
            <label className="block">
              <span className="text-sm font-medium">Status</span>
              <select className="mt-1 w-full border rounded px-2 py-1 text-sm" />
            </label>
            <Button size="sm" className="w-full" onClick={() => setIsOpen(false)}>
              Aplicar Filtros
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
