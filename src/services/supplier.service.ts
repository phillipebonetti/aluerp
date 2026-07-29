import { SupplierRepository, RepositoryOptions } from '@/repositories'
import { prisma } from '@/src/core/database'

export class SupplierService {
  private supplierRepo: SupplierRepository

  constructor() {
    this.supplierRepo = new SupplierRepository()
  }

  async getSuppliersByType(type: string, options: RepositoryOptions): Promise<any[]> {
    return this.supplierRepo.findByType(type, options)
  }

  async getActiveSuppliers(options: RepositoryOptions): Promise<any[]> {
    return this.supplierRepo.findActive(options)
  }

  async calculateSupplierTotalSpent(supplierId: string, options: RepositoryOptions): Promise<number> {
    const transactions = await prisma.transaction.findMany({
      where: {
        companyId: options.companyId,
        supplierId,
        type: 'EXPENSE',
        status: 'PAID',
        deletedAt: null,
      },
    })

    return transactions.reduce((sum, tx) => sum + parseFloat(tx.amount.toString()), 0)
  }

  async getSupplierTransactionHistory(
    supplierId: string,
    options: RepositoryOptions,
  ): Promise<any[]> {
    return prisma.transaction.findMany({
      where: {
        companyId: options.companyId,
        supplierId,
        deletedAt: null,
      },
      orderBy: { createdAt: 'desc' },
    })
  }
}
