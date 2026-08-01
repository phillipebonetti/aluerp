'use server'

import { prisma } from '@/lib/prisma'
import { CashFlowService } from '@/src/lib/services/cash-flow-service'
import { CreateCashMovementSchema, CashFlowFilterSchema, ReconcileMovementSchema } from '@/src/lib/schemas/financial'
import type { CashFlowSummary, FinancialDashboardKPIs } from '@/src/types/financial'

export async function getCashFlow(companyId: string, filters: any) {
  try {
    const validatedFilters = CashFlowFilterSchema.parse(filters)

    const movements = await prisma.cashMovement.findMany({
      where: {
        companyId,
        accountId: validatedFilters.accountId,
        categoryId: validatedFilters.categoryId,
        costCenterId: validatedFilters.costCenterId,
        type: validatedFilters.type,
        status: validatedFilters.status,
        movementDate: {
          gte: validatedFilters.startDate,
          lte: validatedFilters.endDate,
        },
      },
      include: {
        account: true,
        category: true,
        costCenter: true,
      },
      orderBy: { movementDate: 'desc' },
      skip: (validatedFilters.page - 1) * validatedFilters.limit,
      take: validatedFilters.limit,
    })

    const total = await prisma.cashMovement.count({
      where: {
        companyId,
        accountId: validatedFilters.accountId,
        categoryId: validatedFilters.categoryId,
        status: validatedFilters.status,
      },
    })

    return { data: movements, total }
  } catch (error) {
    console.error('Error getting cash flow:', error)
    throw error
  }
}

export async function createCashMovement(companyId: string, data: any) {
  try {
    const validated = CreateCashMovementSchema.parse(data)

    const movement = await prisma.cashMovement.create({
      data: {
        companyId,
        ...validated,
      },
    })

    // Update account balance
    if (validated.type === 'ENTRADA') {
      await prisma.financialAccount.update({
        where: { id: validated.accountId },
        data: { balance: { increment: validated.value } },
      })
    } else if (validated.type === 'SAIDA') {
      await prisma.financialAccount.update({
        where: { id: validated.accountId },
        data: { balance: { decrement: validated.value } },
      })
    }

    return movement
  } catch (error) {
    console.error('Error creating movement:', error)
    throw error
  }
}

export async function reconcileMovement(companyId: string, movementId: string, data: any) {
  try {
    const validated = ReconcileMovementSchema.parse(data)

    const movement = await prisma.cashMovement.update({
      where: { id: movementId },
      data: {
        status: validated.status,
        notes: validated.notes,
        confirmedAt: validated.status === 'CONFIRMADA' ? new Date() : undefined,
      },
    })

    return movement
  } catch (error) {
    console.error('Error reconciling movement:', error)
    throw error
  }
}

export async function deleteCashMovement(companyId: string, movementId: string) {
  try {
    await prisma.cashMovement.delete({
      where: { id: movementId },
    })

    return { success: true }
  } catch (error) {
    console.error('Error deleting movement:', error)
    throw error
  }
}

export async function getCashFlowSummary(companyId: string): Promise<CashFlowSummary> {
  return CashFlowService.getCashFlowSummary(companyId)
}

export async function getFinancialDashboard(companyId: string): Promise<FinancialDashboardKPIs> {
  return CashFlowService.getFinancialDashboardKPIs(companyId)
}

export async function calculateForecast(companyId: string, accountId: string, daysAhead: number) {
  return CashFlowService.calculateForecast(companyId, accountId, daysAhead)
}

export async function getMonthlyChartData(companyId: string) {
  return CashFlowService.getMonthlyChartData(companyId)
}

export async function getExpenseCategoryBreakdown(companyId: string) {
  return CashFlowService.getExpenseCategoryBreakdown(companyId)
}
