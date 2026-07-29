import { BaseRepository, RepositoryOptions } from './base.repository'
import { prisma } from '@/src/core/database'

export interface SupplierWithRelations {
  id: string
  companyId: string
  name: string
  type: string
  document?: string | null
  email?: string | null
  phone?: string | null
  status: string
  paymentTerms?: string | null
  [key: string]: any
}

export class SupplierRepository extends BaseRepository<SupplierWithRelations> {
  protected entityName = 'supplier' as const

  async findByDocument(
    document: string,
    options: RepositoryOptions,
  ): Promise<SupplierWithRelations | null> {
    return prisma.supplier.findFirst({
      where: {
        companyId: options.companyId,
        document,
        deletedAt: null,
      },
    }) as Promise<SupplierWithRelations | null>
  }

  async findActive(options: RepositoryOptions): Promise<SupplierWithRelations[]> {
    return prisma.supplier.findMany({
      where: {
        companyId: options.companyId,
        status: 'ACTIVE',
        deletedAt: null,
      },
      orderBy: { name: 'asc' },
    }) as Promise<SupplierWithRelations[]>
  }

  async findByType(type: string, options: RepositoryOptions): Promise<SupplierWithRelations[]> {
    return prisma.supplier.findMany({
      where: {
        companyId: options.companyId,
        type,
        deletedAt: null,
      },
      orderBy: { name: 'asc' },
    }) as Promise<SupplierWithRelations[]>
  }
}
