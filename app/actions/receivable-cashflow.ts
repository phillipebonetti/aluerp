'use server'

import { ReceivableCashFlowIntegrationService } from '@/lib/services/receivable-cashflow-integration'

export async function registerPaymentWithCashFlow(
  companyId: string,
  accountsReceivableId: string,
  installmentId: string,
  amount: number,
  paymentMethod: string,
  financialAccountId: string,
  paymentDate: Date,
  createdBy: string
) {
  try {
    return await ReceivableCashFlowIntegrationService.registerPaymentWithCashFlow(
      companyId,
      accountsReceivableId,
      installmentId,
      amount,
      paymentMethod,
      financialAccountId,
      paymentDate,
      createdBy
    )
  } catch (error) {
    console.error('[v0] Error registering payment:', error)
    throw error
  }
}

export async function reversePaymentWithCashFlow(
  companyId: string,
  paymentId: string,
  reason: string,
  cancelledBy: string
) {
  try {
    return await ReceivableCashFlowIntegrationService.reversePaymentWithCashFlow(
      companyId,
      paymentId,
      reason,
      cancelledBy
    )
  } catch (error) {
    console.error('[v0] Error reversing payment:', error)
    throw error
  }
}

export async function generateCommissionAfterPayment(accountsReceivableId: string, createdBy: string) {
  try {
    return await ReceivableCashFlowIntegrationService.generateCommissionAfterPayment(
      accountsReceivableId,
      createdBy
    )
  } catch (error) {
    console.error('[v0] Error generating commission:', error)
    throw error
  }
}
