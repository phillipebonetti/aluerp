'use client'

import { useState, useMemo } from 'react'
import type { CRMLead } from '@/src/modules/crm/types'

export interface LeadFilters {
  search: string
  source: string
  status: string
  sortBy: 'name' | 'date' | 'score'
}

export function useLeadFilters(leads: CRMLead[]) {
  const [filters, setFilters] = useState<LeadFilters>({
    search: '',
    source: '',
    status: '',
    sortBy: 'date'
  })

  const filtered = useMemo(() => {
    let result = [...leads]

    // Search filter
    if (filters.search) {
      const search = filters.search.toLowerCase()
      result = result.filter(lead =>
        lead.name.toLowerCase().includes(search) ||
        lead.email.toLowerCase().includes(search) ||
        lead.phone.includes(search)
      )
    }

    // Source filter
    if (filters.source) {
      result = result.filter(lead => lead.source === filters.source)
    }

    // Status filter
    if (filters.status) {
      result = result.filter(lead => lead.status === filters.status)
    }

    // Sort
    result.sort((a, b) => {
      switch (filters.sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'score':
          return (b.value || 0) - (a.value || 0)
        case 'date':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
    })

    return result
  }, [leads, filters])

  return {
    filters,
    setFilters,
    filtered,
    count: filtered.length
  }
}
