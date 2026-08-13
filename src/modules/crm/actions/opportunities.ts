'use server'

import { getSession } from '@/src/core/auth'
import { getPrisma } from '@/src/core/database/client'
import type { CRMOpportunity } from '../types'

async function tenant(companyId?: string) {
  const session = await getSession()
  if (!session) throw new Error('Não autorizado')
  if (companyId && companyId !== session.company.id) throw new Error('Empresa inválida')
  const prisma = await getPrisma()
  if (!prisma) throw new Error('Banco de dados indisponível')
  return { prisma, companyId: session.company.id }
}

export async function getOpportunities(companyId: string): Promise<CRMOpportunity[]> {
  const { prisma, companyId: tenantId } = await tenant(companyId)
  return prisma.opportunity.findMany({ where: { companyId: tenantId }, orderBy: { createdAt: 'desc' } }) as Promise<CRMOpportunity[]>
}

export async function getOpportunityById(id: string, companyId: string): Promise<CRMOpportunity | null> {
  const { prisma, companyId: tenantId } = await tenant(companyId)
  return prisma.opportunity.findFirst({ where: { id, companyId: tenantId } }) as Promise<CRMOpportunity | null>
}

export async function createOpportunity(data: Omit<CRMOpportunity, 'id' | 'companyId' | 'createdAt' | 'updatedAt'> & { companyId?: string }): Promise<CRMOpportunity> {
  const { prisma, companyId } = await tenant(data.companyId)
  const { companyId: _ignored, ...payload } = data
  return prisma.opportunity.create({ data: { ...payload, companyId } as never }) as Promise<CRMOpportunity>
}

export async function updateOpportunity(id: string, data: Partial<CRMOpportunity>): Promise<CRMOpportunity | null> {
  const { prisma, companyId } = await tenant()
  const { id: _id, companyId: _companyId, createdAt: _createdAt, updatedAt: _updatedAt, ...payload } = data
  const existing = await prisma.opportunity.findFirst({ where: { id, companyId } })
  if (!existing) return null
  return prisma.opportunity.update({ where: { id }, data: payload as never }) as Promise<CRMOpportunity>
}

export async function deleteOpportunity(id: string): Promise<boolean> {
  const { prisma, companyId } = await tenant()
  const existing = await prisma.opportunity.findFirst({ where: { id, companyId } })
  if (!existing) return false
  await prisma.opportunity.delete({ where: { id } })
  return true
}

export async function moveOpportunityToStage(id: string, stage: CRMOpportunity['stage']): Promise<CRMOpportunity | null> {
  return updateOpportunity(id, { stage })
}
