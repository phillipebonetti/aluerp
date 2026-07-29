'use server'

import { getCurrentUser } from '@/src/core/auth'
import { FinancialService } from '@/services'
import { TransactionRepository } from '@/repositories'
import { prisma } from '@/src/core/database'

export async function getTransactions(filters?: any) {
  const user = await getCurrentUser()
  if (!user || !user.companyId) {
    return { error: 'Unauthorized' }
  }

  try {
    const financialService = new FinancialService()
    const transactions = await financialService.getTransactions(
      { companyId: user.companyId },
      filters,
    )

    return { data: transactions }
  } catch (error: any) {
    return { error: error.message }
  }
}

export async function getFinancialMetrics() {
  const user = await getCurrentUser()
  if (!user || !user.companyId) {
    return { error: 'Unauthorized' }
  }

  try {
    const financialService = new FinancialService()
    const metrics = await financialService.calculateMetrics({
      companyId: user.companyId,
    })

    return { data: metrics }
  } catch (error: any) {
    return { error: error.message }
  }
}

export async function deleteTransaction(id: string) {
  const user = await getCurrentUser()
  if (!user || !user.companyId) {
    return { error: 'Unauthorized' }
  }

  try {
    const transactionRepo = new TransactionRepository()
    await transactionRepo.softDelete(id, { companyId: user.companyId })

    return { success: true }
  } catch (error: any) {
    return { error: error.message }
  }
}

export async function createTransaction(data: any) {
  const user = await getCurrentUser()
  if (!user || !user.companyId) {
    return { error: 'Unauthorized' }
  }

  try {
    const transaction = await prisma.transaction.create({
      data: {
        ...data,
        companyId: user.companyId,
      },
    })

    return { data: transaction }
  } catch (error: any) {
    return { error: error.message }
  }
}

export async function updateTransaction(id: string, data: any) {
  const user = await getCurrentUser()
  if (!user || !user.companyId) {
    return { error: 'Unauthorized' }
  }

  try {
    const transaction = await prisma.transaction.update({
      where: {
        id,
        companyId: user.companyId,
      },
      data,
    })

    return { data: transaction }
  } catch (error: any) {
    return { error: error.message }
  }
}
