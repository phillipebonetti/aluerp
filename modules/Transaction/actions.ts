'use server'

import { getPrisma } from '@/src/core/database'
import { getSession } from '@/src/core/auth'
import { CreateTransactionSchema, UpdateTransactionSchema } from './schemas'
import type { CreateTransactionInput, UpdateTransactionInput } from './schemas'
import type { TransactionWithRelations, FilterOptions } from './types'

export interface ActionResult<T = null> {
  data?: T
  error?: string
}

// Get transactions with filters
export async function getTransactions(filters?: FilterOptions): Promise<ActionResult<TransactionWithRelations[]>> {
  try {
    const session = await getSession()
    if (!session?.company?.id) {
      return { error: 'Empresa não configurada' }
    }

    const prisma = await getPrisma()
    if (!prisma) {
      return { error: 'Erro de conexão com banco' }
    }

    const where: any = {
      companyId: session.company.id,
    }

    if (filters?.type) where.type = filters.type
    if (filters?.status) where.status = filters.status
    if (filters?.clientId) where.clientId = filters.clientId
    if (filters?.projectId) where.projectId = filters.projectId
    if (filters?.salespersonId) where.salespersonId = filters.salespersonId
    if (filters?.supplierId) where.supplierId = filters.supplierId
    if (filters?.paymentMethod) where.paymentMethod = filters.paymentMethod

    if (filters?.startDate || filters?.endDate) {
      where.dueDate = {}
      if (filters?.startDate) where.dueDate.gte = filters.startDate
      if (filters?.endDate) where.dueDate.lte = filters.endDate
    }

    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        client: { select: { id: true, name: true } },
        project: { select: { id: true, name: true } },
        salesperson: { select: { id: true, name: true } },
        supplier: { select: { id: true, name: true } },
        expenseCategory: { select: { id: true, name: true } },
        incomeCategory: { select: { id: true, name: true } },
        costCenter: { select: { id: true, name: true } },
        bankAccount: { select: { id: true, name: true } },
      },
      orderBy: { dueDate: 'desc' },
    })

    return { data: transactions }
  } catch (error) {
    console.error('[v0] Error getting transactions:', error)
    return { error: 'Erro ao buscar transações' }
  }
}

// Create transaction
export async function createTransaction(input: CreateTransactionInput): Promise<ActionResult<any>> {
  try {
    const session = await getSession()
    if (!session?.company?.id) {
      return { error: 'Empresa não configurada' }
    }

    const validated = CreateTransactionSchema.parse(input)
    const prisma = await getPrisma()
    if (!prisma) {
      return { error: 'Erro de conexão com banco' }
    }

    // Validate relationships belong to company
    if (validated.clientId) {
      const client = await prisma.client.findFirst({
        where: { id: validated.clientId, companyId: session.company.id },
      })
      if (!client) return { error: 'Cliente inválido' }
    }

    if (validated.projectId) {
      const project = await prisma.project.findFirst({
        where: { id: validated.projectId, companyId: session.company.id },
      })
      if (!project) return { error: 'Obra inválida' }
    }

    if (validated.salespersonId) {
      const salesperson = await prisma.employee.findFirst({
        where: { id: validated.salespersonId, companyId: session.company.id },
      })
      if (!salesperson) return { error: 'Vendedor inválido' }
    }

    if (validated.supplierId) {
      const supplier = await prisma.supplier.findFirst({
        where: { id: validated.supplierId, companyId: session.company.id },
      })
      if (!supplier) return { error: 'Fornecedor inválido' }
    }

    const transaction = await prisma.transaction.create({
      data: {
        companyId: session.company.id,
        type: validated.type,
        amount: validated.amount,
        description: validated.description,
        paymentMethod: validated.paymentMethod,
        dueDate: validated.dueDate,
        paymentDate: validated.paymentDate,
        status: validated.status,
        clientId: validated.clientId,
        projectId: validated.projectId,
        salespersonId: validated.salespersonId,
        supplierId: validated.supplierId,
        expenseCategoryId: validated.expenseCategoryId,
        incomeCategoryId: validated.incomeCategoryId,
        costCenterId: validated.costCenterId,
        bankAccountId: validated.bankAccountId,
        notes: validated.notes,
      },
      include: {
        client: true,
        project: true,
        salesperson: true,
        supplier: true,
      },
    })

    return { data: transaction }
  } catch (error) {
    console.error('[v0] Error creating transaction:', error)
    return { error: 'Erro ao criar transação' }
  }
}

// Update transaction
export async function updateTransaction(input: UpdateTransactionInput): Promise<ActionResult<any>> {
  try {
    const session = await getSession()
    if (!session?.company?.id) {
      return { error: 'Empresa não configurada' }
    }

    const validated = UpdateTransactionSchema.parse(input)
    const prisma = await getPrisma()
    if (!prisma) {
      return { error: 'Erro de conexão com banco' }
    }

    const existing = await prisma.transaction.findFirst({
      where: {
        id: validated.id,
        companyId: session.company.id,
      },
    })

    if (!existing) {
      return { error: 'Transação não encontrada' }
    }

    const transaction = await prisma.transaction.update({
      where: { id: validated.id },
      data: {
        type: validated.type,
        amount: validated.amount,
        description: validated.description,
        paymentMethod: validated.paymentMethod,
        dueDate: validated.dueDate,
        paymentDate: validated.paymentDate,
        status: validated.status,
        clientId: validated.clientId,
        projectId: validated.projectId,
        salespersonId: validated.salespersonId,
        supplierId: validated.supplierId,
        expenseCategoryId: validated.expenseCategoryId,
        incomeCategoryId: validated.incomeCategoryId,
        costCenterId: validated.costCenterId,
        bankAccountId: validated.bankAccountId,
        notes: validated.notes,
      },
      include: {
        client: true,
        project: true,
      },
    })

    return { data: transaction }
  } catch (error) {
    console.error('[v0] Error updating transaction:', error)
    return { error: 'Erro ao atualizar transação' }
  }
}

// Delete transaction
export async function deleteTransaction(id: string): Promise<ActionResult> {
  try {
    const session = await getSession()
    if (!session?.company?.id) {
      return { error: 'Empresa não configurada' }
    }

    const prisma = await getPrisma()
    if (!prisma) {
      return { error: 'Erro de conexão com banco' }
    }

    const transaction = await prisma.transaction.findFirst({
      where: {
        id,
        companyId: session.company.id,
      },
    })

    if (!transaction) {
      return { error: 'Transação não encontrada' }
    }

    if (transaction.status === 'PAID') {
      return { error: 'Não é possível deletar transações pagas' }
    }

    await prisma.transaction.delete({
      where: { id },
    })

    return { data: null }
  } catch (error) {
    console.error('[v0] Error deleting transaction:', error)
    return { error: 'Erro ao deletar transação' }
  }
}

// Get transaction statistics
export async function getTransactionStats(): Promise<ActionResult<any>> {
  try {
    const session = await getSession()
    if (!session?.company?.id) {
      return { error: 'Empresa não configurada' }
    }

    const prisma = await getPrisma()
    if (!prisma) {
      return { error: 'Erro de conexão com banco' }
    }

    const now = new Date()

    const income = await prisma.transaction.aggregate({
      where: {
        companyId: session.company.id,
        type: 'INCOME',
      },
      _sum: { amount: true },
    })

    const expense = await prisma.transaction.aggregate({
      where: {
        companyId: session.company.id,
        type: 'EXPENSE',
      },
      _sum: { amount: true },
    })

    const pendingIncome = await prisma.transaction.aggregate({
      where: {
        companyId: session.company.id,
        type: 'INCOME',
        status: 'PENDING',
      },
      _sum: { amount: true },
    })

    const overdueIncome = await prisma.transaction.aggregate({
      where: {
        companyId: session.company.id,
        type: 'INCOME',
        status: { in: ['PENDING', 'OVERDUE'] },
        dueDate: { lt: now },
      },
      _sum: { amount: true },
    })

    const incomeTotal = income._sum.amount ? Number(income._sum.amount) : 0
    const expenseTotal = expense._sum.amount ? Number(expense._sum.amount) : 0
    
    const stats = {
      totalIncome: incomeTotal,
      totalExpense: expenseTotal,
      balance: incomeTotal - expenseTotal,
      pendingIncome: pendingIncome._sum.amount ? Number(pendingIncome._sum.amount) : 0,
      overdueIncome: overdueIncome._sum.amount ? Number(overdueIncome._sum.amount) : 0,
    }

    return { data: stats }
  } catch (error) {
    console.error('[v0] Error getting stats:', error)
    return { error: 'Erro ao calcular estatísticas' }
  }
}
