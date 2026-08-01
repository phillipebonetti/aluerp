import { z } from 'zod'

export const CreateFinancialAccountSchema = z.object({
  name: z.string().min(3),
  type: z.enum(['CONTA_CORRENTE', 'CONTA_POUPANCA', 'CAIXA']),
  bankName: z.string().optional(),
  accountNumber: z.string().optional(),
  branch: z.string().optional(),
  initialBalance: z.number(),
})

export const CreateExpenseCategorySchema = z.object({
  name: z.string().min(3),
  type: z.enum(['FIXA', 'VARIAVEL']),
})

export const CreateCostCenterSchema = z.object({
  name: z.string().min(3),
  description: z.string().optional(),
  allocationPercentage: z.number().min(0).max(100),
})

export const CreateCashMovementSchema = z.object({
  accountId: z.string(),
  categoryId: z.string().optional(),
  costCenterId: z.string().optional(),
  type: z.enum(['ENTRADA', 'SAIDA', 'TRANSFERENCIA', 'AJUSTE']),
  description: z.string().min(3),
  value: z.number().positive(),
  sourceType: z.enum(['OS', 'ORCAMENTO', 'COMISSAO', 'MANUAL', 'PAGAMENTO', 'RECEBIMENTO']).optional(),
  sourceId: z.string().optional(),
  movementDate: z.date(),
  competenceDate: z.date().optional(),
  notes: z.string().optional(),
})

export const ReconcileMovementSchema = z.object({
  status: z.enum(['PREVISTA', 'CONFIRMADA', 'CANCELADA']),
  notes: z.string().optional(),
})

export const CashFlowFilterSchema = z.object({
  accountId: z.string().optional(),
  categoryId: z.string().optional(),
  costCenterId: z.string().optional(),
  type: z.enum(['ENTRADA', 'SAIDA', 'TRANSFERENCIA', 'AJUSTE']).optional(),
  status: z.enum(['PREVISTA', 'CONFIRMADA', 'CANCELADA']).optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  searchTerm: z.string().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
})

export type CreateFinancialAccountInput = z.infer<typeof CreateFinancialAccountSchema>
export type CreateExpenseCategoryInput = z.infer<typeof CreateExpenseCategorySchema>
export type CreateCostCenterInput = z.infer<typeof CreateCostCenterSchema>
export type CreateCashMovementInput = z.infer<typeof CreateCashMovementSchema>
export type ReconcileMovementInput = z.infer<typeof ReconcileMovementSchema>
export type CashFlowFilterInput = z.infer<typeof CashFlowFilterSchema>
