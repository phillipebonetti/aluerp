'use server'

import { CommissionFinancialIntegration } from '@/src/lib/services/commission-financial-integration'

export async function payCommissionAndCreateExpense(
  commissionPaymentId: string,
  paidVia: string,
  paymentReference?: string
) {
  try {
    const expense = await CommissionFinancialIntegration.createExpenseForCommission(
      commissionPaymentId,
      paidVia,
      paymentReference
    )
    return { success: true, data: expense }
  } catch (error) {
    console.error('Error paying commission:', error)
    return { success: false, error: 'Falha ao pagar comissão e criar despesa' }
  }
}

export async function reverseCommissionPayment(commissionPaymentId: string, reason: string) {
  try {
    const result = await CommissionFinancialIntegration.reverseCommissionExpense(commissionPaymentId, reason)
    return { success: true, data: result }
  } catch (error) {
    console.error('Error reversing commission:', error)
    return { success: false, error: 'Falha ao estornar comissão' }
  }
}

export async function getCommissionCashFlowImpact(companyId: string, year: number, month: number) {
  try {
    const impact = await CommissionFinancialIntegration.calculateCashFlowImpact(companyId, year, month)
    return { success: true, data: impact }
  } catch (error) {
    console.error('Error calculating cash flow impact:', error)
    return { success: false, error: 'Falha ao calcular impacto no fluxo de caixa' }
  }
}

export async function getCommissionReconciliation(companyId: string, year: number, month: number) {
  try {
    const reconciliation = await CommissionFinancialIntegration.getPaymentReconciliation(companyId, year, month)
    return { success: true, data: reconciliation }
  } catch (error) {
    console.error('Error getting reconciliation:', error)
    return { success: false, error: 'Falha ao obter reconciliação de comissões' }
  }
}

export async function getCommissionTransactions(companyId: string, year: number, month: number) {
  try {
    const transactions = await CommissionFinancialIntegration.getCommissionTransactions(companyId, year, month)
    return { success: true, data: transactions }
  } catch (error) {
    console.error('Error getting transactions:', error)
    return { success: false, error: 'Falha ao obter transações de comissão' }
  }
}
