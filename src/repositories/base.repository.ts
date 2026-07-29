import { PrismaClient } from '@prisma/client'

export interface RepositoryOptions {
  companyId: string
}

export abstract class BaseRepository<T> {
  protected prisma: PrismaClient
  protected abstract entityName: keyof PrismaClient

  constructor() {
    // Import dinamicamente para evitar problemas de inicialização
    this.prisma = require('@/src/core/database').prisma
  }

  /**
   * Encontra um registro por ID, garantindo que pertence à empresa
   */
  async findById(id: string, options: RepositoryOptions): Promise<T | null> {
    const result = await (this.prisma[this.entityName] as any).findFirst({
      where: {
        id,
        companyId: options.companyId,
        deletedAt: null,
      },
    })
    return result as T | null
  }

  /**
   * Lista todos os registros da empresa
   */
  async findAll(options: RepositoryOptions): Promise<T[]> {
    const results = await (this.prisma[this.entityName] as any).findMany({
      where: {
        companyId: options.companyId,
        deletedAt: null,
      },
      orderBy: { createdAt: 'desc' },
    })
    return results as T[]
  }

  /**
   * Lista com paginação
   */
  async findAllPaginated(
    options: RepositoryOptions,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ data: T[]; total: number; page: number; pages: number }> {
    const skip = (page - 1) * limit

    const [data, total] = await Promise.all([
      (this.prisma[this.entityName] as any).findMany({
        where: {
          companyId: options.companyId,
          deletedAt: null,
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      (this.prisma[this.entityName] as any).count({
        where: {
          companyId: options.companyId,
          deletedAt: null,
        },
      }),
    ])

    const pages = Math.ceil(total / limit)

    return {
      data: data as T[],
      total,
      page,
      pages,
    }
  }

  /**
   * Cria um novo registro
   */
  async create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'> & { companyId: string }): Promise<T> {
    const result = await (this.prisma[this.entityName] as any).create({
      data,
    })
    return result as T
  }

  /**
   * Atualiza um registro
   */
  async update(
    id: string,
    data: Partial<T>,
    options: RepositoryOptions,
  ): Promise<T> {
    const result = await (this.prisma[this.entityName] as any).update({
      where: {
        id,
        companyId: options.companyId,
      },
      data,
    })
    return result as T
  }

  /**
   * Soft delete (marca como deletado)
   */
  async softDelete(id: string, options: RepositoryOptions): Promise<T> {
    const result = await (this.prisma[this.entityName] as any).update({
      where: {
        id,
        companyId: options.companyId,
      },
      data: {
        deletedAt: new Date(),
      },
    })
    return result as T
  }

  /**
   * Hard delete (remove permanentemente)
   */
  async delete(id: string, options: RepositoryOptions): Promise<boolean> {
    await (this.prisma[this.entityName] as any).delete({
      where: {
        id,
        companyId: options.companyId,
      },
    })
    return true
  }

  /**
   * Conta registros
   */
  async count(options: RepositoryOptions): Promise<number> {
    return (this.prisma[this.entityName] as any).count({
      where: {
        companyId: options.companyId,
        deletedAt: null,
      },
    })
  }
}
