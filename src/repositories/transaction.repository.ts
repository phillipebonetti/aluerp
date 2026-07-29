import { BaseRepository, RepositoryOptions } from './base.repository'
import { prisma } from '@/src/core/database'

export interface TransactionWithRelations {
  id: string
  companyId: string
  type: string
  amount: number
  description: string
  status: string
  dueDate: Date | null
  paymentDate: Date | null
  client?: { name: string } | null
  supplier?: { name: string } | null
  project?: { name: string } | null
  bankAccount?: { bankName: string; accountNumber: string } | null
  [key: string]: any
}

export class TransactionRepository extends BaseRepository<TransactionWithRelations> {
  protected entityName = 'transaction' as const

  /**
   * Encontra transações por período
   */
  async findByDateRange(
    options: RepositoryOptions,
    startDate: Date,
    endDate: Date,
  ): Promise<TransactionWithRelations[]> {
    return prisma.transaction.findMany({
      where: {
        companyId: options.companyId,
        dueDate: {
          gte: startDate,
          lte: endDate,
        },
        deletedAt: null,
      },
      include: {
        client: { select: { name: true } },
        supplier: { select: { name: true } },
        project: { select: { name: true } },
        bankAccount: { select: { bankName: true, accountNumber: true } },
      },
      orderBy: { dueDate: 'desc' },
    }) as Promise<TransactionWithRelations[]>
  }

  /**
   * Encontra transações por status
   */
  async findByStatus(
    options: RepositoryOptions,
    status: string,
  ): Promise<TransactionWithRelations[]> {
    return prisma.transaction.findMany({
      where: {
        companyId: options.companyId,
        status,
        deletedAt: null,
      },
      include: {
        client: { select: { name: true } },
        supplier: { select: { name: true } },
        project: { select: { name: true } },
      },
      orderBy: { dueDate: 'desc' },
    }) as Promise<TransactionWithRelations[]>
  }

  /**
   * Encontra transações por tipo (INCOME ou EXPENSE)
   */
  async findByType(
    options: RepositoryOptions,
    type: 'INCOME' | 'EXPENSE',
  ): Promise<TransactionWithRelations[]> {
    return prisma.transaction.findMany({
      where: {
        companyId: options.companyId,
        type,
        deletedAt: null,
      },
      include: {
        client: { select: { name: true } },
        supplier: { select: { name: true } },
      },
      orderBy: { dueDate: 'desc' },
    }) as Promise<TransactionWithRelations[]>
  }

  /**
   * Recupera com relações completas
   */
  async findByIdWithRelations(
    id: string,
    options: RepositoryOptions,
  ): Promise<TransactionWithRelations | null> {
    return prisma.transaction.findFirst({
      where: {
        id,
        companyId: options.companyId,
        deletedAt: null,
      },
      include: {
        client: true,
        supplier: true,
        project: true,
        bankAccount: true,
        costCenter: true,
        expenseCategory: true,
        incomeCategory: true,
      },
    }) as Promise<TransactionWithRelations | null>
  }

  /**
   * Lista com relações paginadas
   */
  async findAllWithRelations(
    options: RepositoryOptions,
    page: number = 1,
    limit: number = 20,
  ): Promise<{
    data: TransactionWithRelations[]
    total: number
    page: number
    pages: number
  }> {
    const skip = (page - 1) * limit

    const [data, total] = await Promise.all([
      prisma.transaction.findMany({
        where: {
          companyId: options.companyId,
          deletedAt: null,
        },
        include: {
          client: { select: { name: true } },
          supplier: { select: { name: true } },
          project: { select: { name: true } },
          bankAccount: { select: { bankName: true, accountNumber: true } },
        },
        skip,
        take: limit,
        orderBy: { dueDate: 'desc' },
      }),
      prisma.transaction.count({
        where: {
          companyId: options.companyId,
          deletedAt: null,
        },
      }),
    ])

    const pages = Math.ceil(total / limit)

    return {
      data: data as TransactionWithRelations[],
      total,
      page,
      pages,
    }
  }

  /**
   * Calcula saldo por período
   */
  async calculateBalance(
    options: RepositoryOptions,
    startDate?: Date,
    endDate?: Date,
  ): Promise<{
    income: number
    expense: number
    balance: number
  }> {
    const where: any = {
      companyId: options.companyId,
      status: 'PAID',
      deletedAt: null,
    }

    if (startDate && endDate) {
      where.paymentDate = {
        gte: startDate,
        lte: endDate,
      }
    }

    const transactions = await prisma.transaction.findMany({ where })

    let income = 0
    let expense = 0

    transactions.forEach((tx: any) => {
      const amount = parseFloat(tx.amount.toString())
      if (tx.type === 'INCOME') {
        income += amount
      } else {
        expense += amount
      }
    })

    return {
      income,
      expense,
      balance: income - expense,
    }
  }

  /**
   * Encuentra transações vencidas
   */
  async findOverdue(options: RepositoryOptions): Promise<TransactionWithRelations[]> {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    return prisma.transaction.findMany({
      where: {
        companyId: options.companyId,
        status: 'PENDING',
        dueDate: {
          lt: today,
        },
        deletedAt: null,
      },
      include: {
        client: { select: { name: true } },
        supplier: { select: { name: true } },
      },
      orderBy: { dueDate: 'asc' },
    }) as Promise<TransactionWithRelations[]>
  }
}
