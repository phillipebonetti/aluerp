'use server'

import { getCurrentUser } from '@/src/core/auth'
import type { CRMOpportunity } from '../types'

// Mock data - replace with actual database calls
const mockOpportunities: CRMOpportunity[] = [
  {
    id: '1',
    companyId: 'comp-1',
    clientId: 'client-1',
    name: 'Projeto Website',
    stage: 'prospecção',
    value: 15000,
    probability: 30,
    expectedCloseDate: new Date('2024-03-15'),
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: '2',
    companyId: 'comp-1',
    clientId: 'client-2',
    name: 'Consultoria Digital',
    stage: 'proposta',
    value: 25000,
    probability: 70,
    expectedCloseDate: new Date('2024-02-28'),
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-20')
  }
]

export async function getOpportunities(companyId: string): Promise<CRMOpportunity[]> {
  const user = await getCurrentUser()
  if (!user) throw new Error('Não autorizado')
  
  // TODO: Replace with actual database query
  return mockOpportunities.filter(opp => opp.companyId === companyId)
}

export async function getOpportunityById(id: string, companyId: string): Promise<CRMOpportunity | null> {
  const user = await getCurrentUser()
  if (!user) throw new Error('Não autorizado')
  
  // TODO: Replace with actual database query
  return mockOpportunities.find(opp => opp.id === id && opp.companyId === companyId) || null
}

export async function createOpportunity(data: Omit<CRMOpportunity, 'id' | 'createdAt' | 'updatedAt'>): Promise<CRMOpportunity> {
  const user = await getCurrentUser()
  if (!user) throw new Error('Não autorizado')
  
  // TODO: Replace with actual database insert
  const newOpp: CRMOpportunity = {
    ...data,
    id: `opp-${Date.now()}`,
    createdAt: new Date(),
    updatedAt: new Date()
  }
  
  return newOpp
}

export async function updateOpportunity(id: string, data: Partial<CRMOpportunity>): Promise<CRMOpportunity | null> {
  const user = await getCurrentUser()
  if (!user) throw new Error('Não autorizado')
  
  // TODO: Replace with actual database update
  const opp = mockOpportunities.find(o => o.id === id)
  if (!opp) return null
  
  return { ...opp, ...data, updatedAt: new Date() }
}

export async function deleteOpportunity(id: string): Promise<boolean> {
  const user = await getCurrentUser()
  if (!user) throw new Error('Não autorizado')
  
  // TODO: Replace with actual database delete
  return true
}

export async function moveOpportunityToStage(id: string, stage: CRMOpportunity['stage']): Promise<CRMOpportunity | null> {
  const user = await getCurrentUser()
  if (!user) throw new Error('Não autorizado')
  
  // TODO: Replace with actual database update
  const opp = mockOpportunities.find(o => o.id === id)
  if (!opp) return null
  
  return { ...opp, stage, updatedAt: new Date() }
}
