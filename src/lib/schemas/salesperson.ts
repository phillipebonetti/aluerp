import { z } from 'zod'

export const CreateSalespersonSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres').max(255),
  email: z.string().email('E-mail inválido').optional().or(z.literal('')),
  phone: z.string().regex(/^\d{10,11}$/, 'Telefone inválido').optional().or(z.literal('')),
  cpf: z.string().regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, 'CPF inválido').optional().or(z.literal('')),
  commissionRate: z.number().min(0, 'Comissão não pode ser negativa').max(100, 'Comissão não pode ser maior que 100%'),
  hireDate: z.date().optional(),
  notes: z.string().optional(),
})

export const UpdateSalespersonSchema = CreateSalespersonSchema.partial()

export const SalespersonFiltersSchema = z.object({
  searchTerm: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'ON_LEAVE', 'FIRED']).optional(),
  isSalesperson: z.boolean().optional(),
  skip: z.number().min(0).optional(),
  take: z.number().min(1).max(100).optional(),
  sortBy: z.enum(['name', 'commissionRate', 'createdAt']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
})

export const CreateCommissionRuleSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  description: z.string().optional(),
  ruleType: z.enum(['PERCENTAGE', 'FIXED', 'TIERED']),
  basePercentage: z.number().min(0).max(100),
  minValue: z.number().min(0).optional(),
  maxValue: z.number().min(0).optional(),
  tier1Percentage: z.number().min(0).max(100).optional(),
  tier1UpTo: z.number().min(0).optional(),
  tier2Percentage: z.number().min(0).max(100).optional(),
  tier2UpTo: z.number().min(0).optional(),
  tier3Percentage: z.number().min(0).max(100).optional(),
  validFrom: z.date().optional(),
  validUntil: z.date().optional(),
})

export const ApproveCommissionSchema = z.object({
  commissionPaymentId: z.string().min(1),
  approvedAmount: z.number().min(0),
})

export const PayCommissionSchema = z.object({
  commissionPaymentId: z.string().min(1),
  paidAmount: z.number().min(0),
  paidVia: z.enum(['PIX', 'TRANSFERENCIA', 'CHEQUE', 'DINHEIRO']),
  paymentReference: z.string().optional(),
})

export const ReverseCommissionSchema = z.object({
  commissionPaymentId: z.string().min(1),
  reason: z.string().min(10, 'Motivo deve ter no mínimo 10 caracteres'),
})

export type CreateSalespersonInput = z.infer<typeof CreateSalespersonSchema>
export type UpdateSalespersonInput = z.infer<typeof UpdateSalespersonSchema>
export type SalespersonFilters = z.infer<typeof SalespersonFiltersSchema>
export type CreateCommissionRule = z.infer<typeof CreateCommissionRuleSchema>
export type ApproveCommission = z.infer<typeof ApproveCommissionSchema>
export type PayCommission = z.infer<typeof PayCommissionSchema>
export type ReverseCommission = z.infer<typeof ReverseCommissionSchema>
