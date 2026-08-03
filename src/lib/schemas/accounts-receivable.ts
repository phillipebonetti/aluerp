import { z } from 'zod'

export const CreateAccountsReceivableSchema = z.object({
  clientId: z.string().min(1, 'Cliente é obrigatório'),
  documentNumber: z.string().min(1, 'Número do documento é obrigatório'),
  type: z.enum(['VENDA', 'SERVIÇO', 'MANUAL']),
  category: z.string().default('OUTRO'),
  costCenterId: z.string().optional(),
  totalValue: z.number().positive('Valor deve ser positivo'),
  dueDate: z.coerce.date(),
  issueDate: z.coerce.date().default(() => new Date()),
  notes: z.string().optional(),
})

export const UpdateAccountsReceivableSchema = CreateAccountsReceivableSchema.partial()

export const CreateInstallmentSchema = z.object({
  accountsReceivableId: z.string(),
  installmentNumber: z.number().positive(),
  value: z.number().positive('Valor deve ser positivo'),
  dueDate: z.coerce.date(),
  paymentMethod: z.enum(['PIX', 'BOLETO', 'TRANSFERENCIA', 'CHEQUE', 'DINHEIRO', 'CARTAO']).optional(),
})

export const RegisterPaymentSchema = z.object({
  accountsReceivableId: z.string().min(1),
  installmentId: z.string().optional(),
  amount: z.number().positive('Valor deve ser positivo'),
  paymentMethod: z.enum(['PIX', 'BOLETO', 'TRANSFERENCIA', 'CHEQUE', 'DINHEIRO', 'CARTAO']),
  paymentDate: z.coerce.date(),
  financialAccountId: z.string().optional(),
  paymentReference: z.string().optional(),
  notes: z.string().optional(),
})

export const GenerateInstallmentsSchema = z.object({
  accountsReceivableId: z.string().min(1),
  numberOfInstallments: z.number().int().min(1).max(12),
  firstDueDate: z.coerce.date(),
})

export type CreateAccountsReceivableInput = z.infer<typeof CreateAccountsReceivableSchema>
export type UpdateAccountsReceivableInput = z.infer<typeof UpdateAccountsReceivableSchema>
export type CreateInstallmentInput = z.infer<typeof CreateInstallmentSchema>
export type RegisterPaymentInput = z.infer<typeof RegisterPaymentSchema>
export type GenerateInstallmentsInput = z.infer<typeof GenerateInstallmentsSchema>
