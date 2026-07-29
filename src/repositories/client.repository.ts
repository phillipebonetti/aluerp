import { BaseRepository, RepositoryOptions } from './base.repository'
import { prisma } from '@/src/core/database'

export interface ClientWithRelations {
  id: string
  companyId: string
  name: string
  type: string
  document?: string | null
  email?: string | null
  phone?: string | null
  status: string
  notes?: string | null
  createdAt: Date
  updatedAt: Date
  [key: string]: any
}

export class ClientRepository extends BaseRepository<ClientWithRelations> {
  protected entityName = 'client' as const

  async findByDocument(
    document: string,
    options: RepositoryOptions,
  ): Promise<ClientWithRelations | null> {
    return prisma.client.findFirst({
      where: {
        companyId: options.companyId,
        document,
        deletedAt: null,
      },
    }) as Promise<ClientWithRelations | null>
  }

  async findActive(options: RepositoryOptions): Promise<ClientWithRelations[]> {
    return prisma.client.findMany({
      where: {
        companyId: options.companyId,
        status: 'ACTIVE',
        deletedAt: null,
      },
      orderBy: { name: 'asc' },
    }) as Promise<ClientWithRelations[]>
  }

  async countActive(options: RepositoryOptions): Promise<number> {
    return prisma.client.count({
      where: {
        companyId: options.companyId,
        status: 'ACTIVE',
        deletedAt: null,
      },
    })
  }
}
