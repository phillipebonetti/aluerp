import { BaseRepository, RepositoryOptions } from './base.repository'
import { prisma } from '@/src/core/database'

export interface EmployeeWithRelations {
  id: string
  companyId: string
  name: string
  email?: string | null
  phone?: string | null
  role: string
  commissionRate: number
  status: string
  [key: string]: any
}

export class EmployeeRepository extends BaseRepository<EmployeeWithRelations> {
  protected entityName = 'employee' as const

  async findActive(options: RepositoryOptions): Promise<EmployeeWithRelations[]> {
    return prisma.employee.findMany({
      where: {
        companyId: options.companyId,
        status: 'ACTIVE',
        deletedAt: null,
      },
      orderBy: { name: 'asc' },
    }) as Promise<EmployeeWithRelations[]>
  }

  async findBySalesperson(options: RepositoryOptions): Promise<EmployeeWithRelations[]> {
    return prisma.employee.findMany({
      where: {
        companyId: options.companyId,
        role: { contains: 'SALES' },
        status: 'ACTIVE',
        deletedAt: null,
      },
      orderBy: { name: 'asc' },
    }) as Promise<EmployeeWithRelations[]>
  }

  async countActive(options: RepositoryOptions): Promise<number> {
    return prisma.employee.count({
      where: {
        companyId: options.companyId,
        status: 'ACTIVE',
        deletedAt: null,
      },
    })
  }
}
