'use server'

import { CashFlowAutomationService } from '@/src/lib/services/cashflow-automation-service'
import { Decimal } from '@prisma/client/runtime/library'

export async function createMovementFromReceipt(
  companyId: string,
  accountsReceivableId: string,
  paymentId: string,
  amount: number,
  paymentDate: Date,
  paymentMethod: string,
  financialAccountId?: string,
  createdBy?: string
) {
  try {
    const movement = await CashFlowAutomationService.onReceivablePayment(
      companyId,
      accountsReceivableId,
      paymentId,
      new Decimal(amount),
      paymentDate,
      paymentMethod,
      financialAccountId,
      createdBy
    )
    return { success: true, data: movement }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function createMovementFromPayment(
  companyId: string,
  payableId: string,
  paymentId: string,
  amount: number,
  paymentDate: Date,
  paymentMethod: string,
  financialAccountId?: string,
  createdBy?: string
) {
  try {
    const movement = await CashFlowAutomationService.onPayablePayment(
      companyId,
      payableId,
      paymentId,
      new Decimal(amount),
      paymentDate,
      paymentMethod,
      financialAccountId,
      createdBy
    )
    return { success: true, data: movement }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function reverseMovement(companyId: string, paymentId: string, createdBy?: string) {
  try {
    const reverseMovement = await CashFlowAutomationService.reversePayment(
      companyId,
      paymentId,
      createdBy
    )
    return { success: true, data: reverseMovement }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function syncAllMovements(companyId: string) {
  try {
    const result = await CashFlowAutomationService.syncAllPendingMovements(companyId)
    return { success: true, data: result }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
