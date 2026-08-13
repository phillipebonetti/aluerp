'use server'

import { getSession } from '@/src/core/auth'
import { getPrisma } from '@/src/core/database/client'
import type { CRMLead } from '../types'

async function tenant(companyId?: string) {
  const session = await getSession()
  if (!session) throw new Error('Não autorizado')
  if (companyId && companyId !== session.company.id) throw new Error('Empresa inválida')
  const prisma = await getPrisma()
  if (!prisma) throw new Error('Banco de dados indisponível')
  return { prisma, companyId: session.company.id }
}

export async function getLeads(companyId: string): Promise<CRMLead[]> {
  const { prisma, companyId: tenantId } = await tenant(companyId)
  return prisma.lead.findMany({ where: { companyId: tenantId }, orderBy: { createdAt: 'desc' } }) as Promise<CRMLead[]>
}

export async function getLeadById(id: string, companyId: string): Promise<CRMLead | null> {
  const { prisma, companyId: tenantId } = await tenant(companyId)
  return prisma.lead.findFirst({ where: { id, companyId: tenantId } }) as Promise<CRMLead | null>
}

export async function createLead(data: Omit<CRMLead, 'id' | 'companyId' | 'createdAt' | 'updatedAt'> & { companyId?: string }): Promise<CRMLead> {
  const { prisma, companyId } = await tenant(data.companyId)
  const { companyId: _ignored, ...payload } = data
  return prisma.lead.create({ data: { ...payload, companyId } as never }) as Promise<CRMLead>
}

export async function updateLead(id: string, data: Partial<CRMLead>): Promise<CRMLead | null> {
  const { prisma, companyId } = await tenant()
  const { id: _id, companyId: _companyId, createdAt: _createdAt, updatedAt: _updatedAt, ...payload } = data
  const existing = await prisma.lead.findFirst({ where: { id, companyId } })
  if (!existing) return null
  return prisma.lead.update({ where: { id }, data: payload as never }) as Promise<CRMLead>
}

export async function deleteLead(id: string): Promise<boolean> {
  const { prisma, companyId } = await tenant()
  const existing = await prisma.lead.findFirst({ where: { id, companyId } })
  if (!existing) return false
  await prisma.lead.delete({ where: { id } })
  return true
}
