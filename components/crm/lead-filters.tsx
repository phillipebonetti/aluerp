'use client'

import { Card } from '@/components/ui/card'
import { FormSelect } from '@/components/ui/form-select'
import { FormInput } from '@/components/ui/form-input'
import { Button } from '@/components/ui/button'
import type { LeadFilters } from '@/src/hooks/crm/useLeadFilters'
import { X } from 'lucide-react'

interface LeadFiltersProps {
  filters: LeadFilters
  onChange: (filters: LeadFilters) => void
  onReset?: () => void
}

const sourceOptions = [
  { value: '', label: 'Todas as fontes' },
  { value: 'website', label: 'Website' },
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Telefone' },
  { value: 'referral', label: 'Indicação' },
  { value: 'social', label: 'Redes Sociais' }
]

const statusOptions = [
  { value: '', label: 'Todos os status' },
  { value: 'novo', label: 'Novo' },
  { value: 'em_contato', label: 'Em Contato' },
  { value: 'interessado', label: 'Interessado' },
  { value: 'proposta', label: 'Proposta' },
  { value: 'perdido', label: 'Perdido' }
]

const sortOptions = [
  { value: 'date', label: 'Data (mais recentes)' },
  { value: 'name', label: 'Nome (A-Z)' },
  { value: 'score', label: 'Valor (maior)' }
]

export function LeadFilters({ filters, onChange, onReset }: LeadFiltersProps) {
  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Filtros</h3>
          {(filters.search || filters.source || filters.status) && onReset && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onReset}
              className="text-xs"
            >
              <X className="w-3 h-3 mr-1" />
              Limpar
            </Button>
          )}
        </div>

        <FormInput
          placeholder="Buscar por nome, email ou telefone..."
          value={filters.search}
          onChange={e => onChange({ ...filters, search: e.target.value })}
          className="text-sm"
        />

        <FormSelect
          options={sourceOptions}
          value={filters.source}
          onChange={value => onChange({ ...filters, source: value })}
          label="Fonte"
        />

        <FormSelect
          options={statusOptions}
          value={filters.status}
          onChange={value => onChange({ ...filters, status: value })}
          label="Status"
        />

        <FormSelect
          options={sortOptions}
          value={filters.sortBy}
          onChange={value => onChange({ ...filters, sortBy: value as any })}
          label="Ordenar por"
        />
      </div>
    </Card>
  )
}
