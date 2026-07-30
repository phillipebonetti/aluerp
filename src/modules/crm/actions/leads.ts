'use server'

import { getCurrentUser } from '@/src/core/auth'
import type { CRMLead } from '../types'

// Mock data - replace with actual database calls
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

export async function getLeads(companyId: string): Promise<CRMLead[]> {
  const user = await getCurrentUser()
  if (!user) throw new Error('Não autorizado')
  
  // TODO: Replace with actual database query
  return mockLeads.filter(lead => lead.companyId === companyId)
}

export async function getLeadById(id: string, companyId: string): Promise<CRMLead | null> {
  const user = await getCurrentUser()
  if (!user) throw new Error('Não autorizado')
  
  // TODO: Replace with actual database query
  return mockLeads.find(lead => lead.id === id && lead.companyId === companyId) || null
}

export async function createLead(data: Omit<CRMLead, 'id' | 'createdAt' | 'updatedAt'>): Promise<CRMLead> {
  const user = await getCurrentUser()
  if (!user) throw new Error('Não autorizado')
  
  // TODO: Replace with actual database insert
  const newLead: CRMLead = {
    ...data,
    id: `lead-${Date.now()}`,
    createdAt: new Date(),
    updatedAt: new Date()
  }
  
  return newLead
}

export async function updateLead(id: string, data: Partial<CRMLead>): Promise<CRMLead | null> {
  const user = await getCurrentUser()
  if (!user) throw new Error('Não autorizado')
  
  // TODO: Replace with actual database update
  const lead = mockLeads.find(l => l.id === id)
  if (!lead) return null
  
  return { ...lead, ...data, updatedAt: new Date() }
}

export async function deleteLead(id: string): Promise<boolean> {
  const user = await getCurrentUser()
  if (!user) throw new Error('Não autorizado')
  
  // TODO: Replace with actual database delete
  return true
}
