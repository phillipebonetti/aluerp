import { z } from 'zod'

// Enums
const ServiceOrderStatusSchema = z.enum(['DRAFT', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'ARCHIVED'])
const ServiceOrderPrioritySchema = z.enum(['BAIXA', 'NORMAL', 'ALTA', 'URGENTE'])
const ProductionStageStatusSchema = z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'BLOCKED'])
const OSCommentTypeSchema = z.enum(['COMMENT', 'STATUS_CHANGE', 'NOTE', 'ATTACHMENT_ADDED'])
const AttachmentCategorySchema = z.enum(['PHOTO', 'DOCUMENT', 'DRAWING', 'VIDEO'])

// Create OS
export const CreateOSSchema = z.object({
  projectId: z.string().cuid('ID do projeto inválido'),
  clientId: z.string().cuid('ID do cliente inválido'),
  vendedorId: z.string().cuid('ID do vendedor inválido').optional(),
  number: z.string().optional(),
  status: ServiceOrderStatusSchema.default('DRAFT'),
  priority: ServiceOrderPrioritySchema.default('NORMAL'),
  scheduledDate: z.date().optional(),
  description: z.string().max(500).optional(),
  notes: z.string().max(1000).optional(),
  totalValue: z.number().positive('Valor total deve ser positivo').default(0),
  downPayment: z.number().nonnegative('Entrada não pode ser negativa').default(0),
  installments: z.number().int().min(1).max(24).default(1),
})

export type CreateOSInput = z.infer<typeof CreateOSSchema>

// Update OS
export const UpdateOSSchema = z.object({
  projectId: z.string().cuid().optional(),
  clientId: z.string().cuid().optional(),
  vendedorId: z.string().cuid().optional(),
  status: ServiceOrderStatusSchema.optional(),
  priority: ServiceOrderPrioritySchema.optional(),
  scheduledDate: z.date().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  description: z.string().max(500).optional(),
  notes: z.string().max(1000).optional(),
  totalValue: z.number().positive().optional(),
  downPayment: z.number().nonnegative().optional(),
  installments: z.number().int().min(1).max(24).optional(),
}).strict()

export type UpdateOSInput = z.infer<typeof UpdateOSSchema>

// OS Product
export const CreateOSProductSchema = z.object({
  sequence: z.number().int().positive('Sequência deve ser positiva'),
  description: z.string().min(1, 'Descrição é obrigatória').max(500),
  quantity: z.number().positive('Quantidade deve ser positiva'),
  width: z.number().positive().optional(),
  height: z.number().positive().optional(),
  unitValue: z.number().positive('Valor unitário deve ser positivo'),
  notes: z.string().max(500).optional(),
})

export type CreateOSProductInput = z.infer<typeof CreateOSProductSchema>

// Production Stage
export const CreateProductionStageSchema = z.object({
  sequence: z.number().int().positive('Sequência deve ser positiva'),
  name: z.string().min(1, 'Nome é obrigatório').max(100),
  responsibleId: z.string().cuid().optional(),
  notes: z.string().max(500).optional(),
})

export type CreateProductionStageInput = z.infer<typeof CreateProductionStageSchema>

export const UpdateProductionStageSchema = z.object({
  status: ProductionStageStatusSchema.optional(),
  responsibleId: z.string().cuid().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  notes: z.string().max(500).optional(),
}).strict()

export type UpdateProductionStageInput = z.infer<typeof UpdateProductionStageSchema>

// Installation
export const CreateInstallationSchema = z.object({
  teamLeadId: z.string().cuid().optional(),
  scheduledDate: z.date().optional(),
  address: z.string().max(200).optional(),
  city: z.string().max(100).optional(),
  state: z.string().length(2).optional(),
  postalCode: z.string().regex(/^\d{5}-?\d{3}$/, 'CEP inválido').optional(),
  contactName: z.string().max(100).optional(),
  contactPhone: z.string().regex(/^\(\d{2}\)\s?\d{4,5}-\d{4}$/, 'Telefone inválido').optional(),
  notes: z.string().max(500).optional(),
})

export type CreateInstallationInput = z.infer<typeof CreateInstallationSchema>

// Comment
export const CreateCommentSchema = z.object({
  type: OSCommentTypeSchema.default('COMMENT'),
  content: z.string().min(1, 'Comentário não pode estar vazio').max(1000),
})

export type CreateCommentInput = z.infer<typeof CreateCommentSchema>

// List Filters
export const OSListFiltersSchema = z.object({
  clientId: z.string().cuid().optional(),
  vendedorId: z.string().cuid().optional(),
  status: ServiceOrderStatusSchema.optional(),
  priority: ServiceOrderPrioritySchema.optional(),
  dateFrom: z.date().optional(),
  dateTo: z.date().optional(),
  searchTerm: z.string().max(100).optional(),
  skip: z.number().nonnegative().default(0),
  take: z.number().positive().default(10),
  sortBy: z.enum(['number', 'createdAt', 'scheduledDate', 'totalValue']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

export type OSListFiltersInput = z.infer<typeof OSListFiltersSchema>

// Bulk operations
export const BulkChangeStatusSchema = z.object({
  osIds: z.array(z.string().cuid()).min(1, 'Selecione pelo menos uma OS'),
  status: ServiceOrderStatusSchema,
})

export type BulkChangeStatusInput = z.infer<typeof BulkChangeStatusSchema>

export const DuplicateOSSchema = z.object({
  osId: z.string().cuid('ID da OS inválido'),
  number: z.string().optional(),
})

export type DuplicateOSInput = z.infer<typeof DuplicateOSSchema>
