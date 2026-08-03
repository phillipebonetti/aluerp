'use server'

import { AccountsReceivableService } from '@/src/lib/services/accounts-receivable-service'
import {
  CreateAccountsReceivableSchema,
  UpdateAccountsReceivableSchema,
  RegisterPaymentSchema,
  GenerateInstallmentsSchema,
} from '@/src/lib/schemas/accounts-receivable'

export async function createReceivable(companyId: string, input: unknown) {
  const validated = CreateAccountsReceivableSchema.parse(input)
  return await AccountsReceivableService.createReceivable({
    companyId,
    ...validated,
  })
}

export async function getReceivable(companyId: string, receivableId: string) {
  return await AccountsReceivableService.getReceivable(companyId, receivableId)
}

export async function listReceivables(
  companyId: string,
  filters?: { status?: string; clientId?: string; overdueOnly?: boolean; skip?: number; take?: number }
) {
  return await AccountsReceivableService.listReceivables(companyId, filters)
}

export async function updateReceivable(
  companyId: string,
  receivableId: string,
  input: unknown
) {
  const validated = UpdateAccountsReceivableSchema.parse(input)
  return await AccountsReceivableService.updateReceivable(companyId, receivableId, validated)
}

export async function cancelReceivable(companyId: string, receivableId: string, reason?: string) {
  return await AccountsReceivableService.cancelReceivable(companyId, receivableId, reason)
}

export async function registerPayment(
  companyId: string,
  input: unknown,
  userId: string
) {
  const validated = RegisterPaymentSchema.parse(input)
  return await AccountsReceivableService.registerPayment({
    companyId,
    ...validated,
    createdBy: userId,
  })
}

export async function reversePayment(companyId: string, paymentId: string, reason?: string) {
  return await AccountsReceivableService.reversePayment(companyId, paymentId, reason)
}

export async function getReceivableSummary(companyId: string) {
  return await AccountsReceivableService.getSummary(companyId)
}

export async function generateInstallments(companyId: string, input: unknown) {
  const validated = GenerateInstallmentsSchema.parse(input)
  const receivable = await AccountsReceivableService.getReceivable(companyId, validated.accountsReceivableId)

  if (!receivable) throw new Error('Conta a receber não encontrada')

  const installmentValue = receivable.totalValue.toNumber() / validated.numberOfInstallments
  const installments = []

  for (let i = 1; i <= validated.numberOfInstallments; i++) {
    const dueDate = new Date(validated.firstDueDate)
    dueDate.setMonth(dueDate.getMonth() + i - 1)

    const installment = await AccountsReceivableService.createHistory({
      companyId,
      accountsReceivableId: validated.accountsReceivableId,
      eventType: 'CREATED',
      description: `Parcela ${i}/${validated.numberOfInstallments} criada: R$ ${installmentValue.toFixed(2)}`,
      newValue: installmentValue,
    })

    installments.push({
      installmentNumber: i,
      value: installmentValue,
      dueDate,
    })
  }

  return installments
}
