import { z } from 'zod'

// Material Management Schemas
export const MaterialCategoryEnum = z.enum(['ALUMINIO', 'VIDRO', 'FERRAGENS', 'ACESSORIOS', 'OUTROS'])
export const MaterialStatusEnum = z.enum(['PENDING', 'PURCHASED', 'RECEIVED', 'PARTIAL', 'CANCELLED'])

export const CreateOSMaterialSchema = z.object({
  serviceOrderId: z.string().cuid(),
  sequence: z.number().int().min(1),
  name: z.string().min(3).max(255),
  category: MaterialCategoryEnum,
  description: z.string().optional(),
  quantity: z.number().positive(),
  unit: z.string().default('un'),
  unitCost: z.number().positive(),
  supplier: z.string().optional(),
  notes: z.string().optional(),
})

export const UpdateOSMaterialSchema = CreateOSMaterialSchema.partial().extend({
  id: z.string().cuid(),
  status: MaterialStatusEnum.optional(),
  purchaseDate: z.date().optional(),
  receivedDate: z.date().optional(),
  receivedQty: z.number().nonnegative().optional(),
})

export const UpdateMaterialStatusSchema = z.object({
  id: z.string().cuid(),
  status: MaterialStatusEnum,
  receivedQty: z.number().nonnegative().optional(),
})

// Commission Management Schemas
export const CommissionStatusEnum = z.enum(['PENDING', 'APPROVED', 'PAID', 'CANCELLED'])

export const CreateOSCommissionSchema = z.object({
  serviceOrderId: z.string().cuid(),
  vendedorId: z.string().cuid(),
  osValue: z.number().positive(),
  commissionRate: z.number().min(0).max(100),
})

export const UpdateOSCommissionSchema = CreateOSCommissionSchema.partial().extend({
  id: z.string().cuid(),
  status: CommissionStatusEnum.optional(),
  approvedBy: z.string().cuid().optional(),
  paidAt: z.date().optional(),
  notes: z.string().optional(),
})

export const ApproveCommissionSchema = z.object({
  id: z.string().cuid(),
  approvedBy: z.string().cuid(),
})

export const PayCommissionSchema = z.object({
  id: z.string().cuid(),
  paidAt: z.date().default(() => new Date()),
})

// Progress Bar Schemas
export const ProgressDataSchema = z.object({
  overallProgress: z.number().min(0).max(100),
  productionProgress: z.number().min(0).max(100),
  installationProgress: z.number().min(0).max(100),
  estimatedDays: z.number().nonnegative(),
  elapsedDays: z.number().nonnegative(),
  remainingDays: z.number().nonnegative(),
  isOverdue: z.boolean(),
})

// Checklist Schemas
export const ChecklistItemSchema = z.object({
  id: z.string().cuid(),
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  completed: z.boolean().default(false),
  photoUrl: z.string().url().optional(),
  notes: z.string().optional(),
})

export const CreateChecklistSchema = z.object({
  serviceOrderId: z.string().cuid(),
  items: z.array(ChecklistItemSchema).min(1),
})

export const UpdateChecklistItemSchema = z.object({
  id: z.string().cuid(),
  completed: z.boolean(),
  photoUrl: z.string().url().optional(),
  notes: z.string().optional(),
})

// Type exports for components
export type CreateOSMaterial = z.infer<typeof CreateOSMaterialSchema>
export type UpdateOSMaterial = z.infer<typeof UpdateOSMaterialSchema>
export type UpdateMaterialStatus = z.infer<typeof UpdateMaterialStatusSchema>
export type CreateOSCommission = z.infer<typeof CreateOSCommissionSchema>
export type UpdateOSCommission = z.infer<typeof UpdateOSCommissionSchema>
export type ApproveCommission = z.infer<typeof ApproveCommissionSchema>
export type PayCommission = z.infer<typeof PayCommissionSchema>
export type ProgressData = z.infer<typeof ProgressDataSchema>
export type ChecklistItem = z.infer<typeof ChecklistItemSchema>
export type UpdateChecklistItem = z.infer<typeof UpdateChecklistItemSchema>
