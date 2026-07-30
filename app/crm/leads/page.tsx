'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { LeadTable, LeadFilters } from '@/components/crm'
import { useLeadFilters } from '@/src/hooks/crm/useLeadFilters'
import type { CRMLead } from '@/src/modules/crm/types'
import { Plus } from 'lucide-react'

// Mock data - replace with server data
const mockLeads: CRMLead[] = [
  {
    id: '1',
    name: 'João Silva',
    email: 'joao@example.com',
    phone: '(11) 98765-4321',
    company: 'Tech Corp',
    source: 'website',
    status: 'novo',
    value: 5000,
    notes: 'Lead qualificado',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
    companyId: 'comp-1'
  },
  {
    id: '2',
    name: 'Maria Santos',
    email: 'maria@example.com',
    phone: '(11) 97654-3210',
    company: 'Digital Solutions',
    source: 'referral',
    status: 'em_contato',
    value: 8000,
    notes: 'Interessado em proposta',
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-22'),
    companyId: 'comp-1'
  }
]

export default function LeadsPage() {
  const { filters, setFilters, filtered, count } = useLeadFilters(mockLeads)
  const [isCreating, setIsCreating] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Leads</h1>
          <p className="text-muted-foreground mt-1">Gerencie todos os seus leads</p>
        </div>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Lead
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <LeadFilters
            filters={filters}
            onChange={setFilters}
            onReset={() => setFilters({ search: '', source: '', status: '', sortBy: 'date' })}
          />
        </div>

        <div className="lg:col-span-3">
          <div className="mb-4 text-sm text-muted-foreground">
            {count} lead{count !== 1 ? 's' : ''} encontrado{count !== 1 ? 's' : ''}
          </div>
          <LeadTable
            leads={filtered}
            onRowClick={(lead) => console.log('Lead selecionado:', lead)}
          />
        </div>
      </div>
    </div>
  )
}
