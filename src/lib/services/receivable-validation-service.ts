import { z } from 'zod'
import prisma from '@/lib/prisma'

// Zod Schemas
export const CreateReceivableSchema = z.object({
  clientId: z.string().min(1, 'Cliente é obrigatório'),
  quoteId: z.string().optional(),
  serviceOrderId: z.string().optional(),
  documentNumber: z.string().min(1, 'Número do documento é obrigatório'),
  totalValue: z.number().positive('Valor deve ser positivo'),
  numberOfInstallments: z.number().int().min(1, 'Mínimo 1 parcela'),
  firstDueDate: z.date(),
})

export const UpdateReceivableSchema = z.object({
  documentNumber: z.string().optional(),
  dueDate: z.date().optional(),
  notes: z.string().optional(),
})

export const RegisterPaymentSchema = z.object({
  accountsReceivableId: z.string().min(1),
  installmentId: z.string().min(1),
  amount: z.number().positive('Valor deve ser positivo'),
  paymentMethod: z.enum(['PIX', 'BOLETO', 'TRANSFERENCIA', 'CHEQUE', 'DINHEIRO']),
  financialAccountId: z.string().min(1),
  paymentDate: z.date(),
})

// Permissions
export type UserRole = 'ADMIN' | 'FINANCEIRO' | 'VENDEDOR'

export class ReceivablePermissionService {
  static canCreateReceivable(role: UserRole): boolean {
    return ['ADMIN', 'FINANCEIRO'].includes(role)
  }

  static canEditReceivable(role: UserRole): boolean {
    return ['ADMIN', 'FINANCEIRO'].includes(role)
  }

  static canDeleteReceivable(role: UserRole): boolean {
    return role === 'ADMIN'
  }

  static canRegisterPayment(role: UserRole): boolean {
    return ['ADMIN', 'FINANCEIRO'].includes(role)
  }

  static canViewAll(role: UserRole): boolean {
    return ['ADMIN', 'FINANCEIRO'].includes(role)
  }

  static canViewOwnOnly(role: UserRole): boolean {
    return role === 'VENDEDOR'
  }

  static async canViewReceivable(userId: string, receivableId: string, role: UserRole): Promise<boolean> {
    if (role === 'ADMIN' || role === 'FINANCEIRO') return true

    if (role === 'VENDEDOR') {
      const receivable = await prisma.accountsReceivable.findUnique({
        where: { id: receivableId },
        select: { serviceOrder: { select: { vendedorId: true } } },
      })

      return receivable?.serviceOrder?.vendedorId === userId
    }

    return false
  }
}

// Validations
export class ReceivableValidationService {
  static validateCreateReceivable(data: unknown) {
    return CreateReceivableSchema.parse(data)
  }

  static validateUpdateReceivable(data: unknown) {
    return UpdateReceivableSchema.parse(data)
  }

  static validateRegisterPayment(data: unknown) {
    return RegisterPaymentSchema.parse(data)
  }

  static async validateClientExists(clientId: string): Promise<boolean> {
    const client = await prisma.client.findUnique({ where: { id: clientId } })
    return !!client
  }

  static async validateNoDuplication(companyId: string, documentNumber: string): Promise<boolean> {
    const existing = await prisma.accountsReceivable.findFirst({
      where: { companyId, documentNumber },
    })
    return !existing
  }

  static async validateInstallmentConsistency(
    totalValue: number,
    numberOfInstallments: number,
    firstDueDate: Date
  ): Promise<boolean> {
    if (numberOfInstallments < 1) return false
    if (totalValue <= 0) return false
    if (firstDueDate < new Date()) return false
    return true
  }

  static async validateQuoteApproved(quoteId: string): Promise<boolean> {
    const quote = await prisma.quote.findUnique({ where: { id: quoteId } })
    return quote?.status === 'APROVADO'
  }

  static async validateServiceOrderExists(serviceOrderId: string): Promise<boolean> {
    const so = await prisma.serviceOrder.findUnique({ where: { id: serviceOrderId } })
    return !!so
  }

  static async validatePaymentAmount(installmentId: string, amount: number): Promise<boolean> {
    const installment = await prisma.receivableInstallment.findUnique({
      where: { id: installmentId },
    })

    if (!installment) return false

    const remaining = installment.value.toNumber() - installment.receivedValue.toNumber()
    return amount > 0 && amount <= remaining
  }

  static async validateFinancialAccountExists(accountId: string): Promise<boolean> {
    const account = await prisma.financialAccount.findUnique({ where: { id: accountId } })
    return !!account
  }
}
