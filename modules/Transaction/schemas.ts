import { z } from 'zod'
import type { TransactionType, TransactionStatus, PaymentMethod } from './types'

export const CreateTransactionSchema = z.object({
  type: z.enum(['INCOME', 'EXPENSE']) as z.ZodType<TransactionType>,
  amount: z.number().positive('Valor deve ser maior que 0'),
  description: z.string().min(3, 'Descrição deve ter pelo menos 3 caracteres'),
  paymentMethod: z.enum(['CASH', 'CHECK', 'TRANSFER', 'CREDIT_CARD', 'PIX']) as z.ZodType<PaymentMethod>,
  dueDate: z.coerce.date(),
  status: z.enum(['PENDING', 'PAID', 'OVERDUE', 'CANCELLED']) as z.ZodType<TransactionStatus>,
  clientId: z.string().optional(),
  projectId: z.string().optional(),
  salespersonId: z.string().optional(),
  supplierId: z.string().optional(),
  expenseCategoryId: z.string().optional(),
  incomeCategoryId: z.string().optional(),
  costCenterId: z.string().optional(),
  bankAccountId: z.string().optional(),
  paymentDate: z.coerce.date().optional(),
  notes: z.string().optional(),
})

export const UpdateTransactionSchema = CreateTransactionSchema.extend({
  id: z.string(),
}).partial().required({ id: true })

export type CreateTransactionInput = z.infer<typeof CreateTransactionSchema>
export type UpdateTransactionInput = z.infer<typeof UpdateTransactionSchema>
