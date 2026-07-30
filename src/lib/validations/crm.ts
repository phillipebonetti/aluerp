import { z } from 'zod'

/**
 * Schemas de validação para módulo CRM
 * Validação completa de leads, oportunidades e atividades
 */

// Base validators
const brazilianPhone = z
  .string()
  .regex(/^\(\d{2}\)\s\d{4,5}-\d{4}$/, 'Telefone inválido')
  .optional()
  .or(z.literal(''))

const brazilianCPF = z
  .string()
  .regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, 'CPF inválido')
  .optional()
  .or(z.literal(''))

const brazilianCNPJ = z
  .string()
  .regex(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/, 'CNPJ inválido')
  .optional()
  .or(z.literal(''))

// ═══════════════════════════════════════════════════════════════
// LEAD SCHEMAS
// ═══════════════════════════════════════════════════════════════

export const createLeadSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres').max(255),
  email: z
    .string()
    .email('Email inválido')
    .optional()
    .or(z.literal('')),
  phone: brazilianPhone,
  whatsapp: brazilianPhone,
  cpf: brazilianCPF,
  cnpj: brazilianCNPJ,
  city: z.string().optional(),
  state: z.string().length(2, 'Estado deve ter 2 caracteres').optional(),
  zipCode: z
    .string()
    .regex(/^\d{5}-\d{3}$/, 'CEP inválido')
    .optional()
    .or(z.literal('')),
  address: z.string().optional(),
  source: z
    .enum(['INSTAGRAM', 'FACEBOOK', 'GOOGLE', 'INDICACAO', 'SITE', 'MARKETPLACE', 'OUTRO'])
    .default('OUTRO'),
  interests: z
    .array(z.enum(['Box', 'Portão', 'Cobertura', 'Esquadrias', 'Sacada', 'Vidro_Temperado', 'Alumínio', 'Outros']))
    .optional(),
  estimatedValue: z.coerce.number().positive().optional(),
  responsibleId: z.string().optional(),
  notes: z.string().optional(),
})

export type CreateLeadInput = z.infer<typeof createLeadSchema>

export const updateLeadSchema = createLeadSchema.extend({
  id: z.string(),
  status: z.enum(['NEW', 'CONTACTED', 'QUALIFIED', 'UNQUALIFIED', 'CONVERTED', 'LOST']).optional(),
})

export type UpdateLeadInput = z.infer<typeof updateLeadSchema>

// Importação em lote
export const importLeadsSchema = z.object({
  file: z.instanceof(File),
  mapping: z.record(z.string()), // Mapeamento de colunas
})

export type ImportLeadsInput = z.infer<typeof importLeadsSchema>

// ═══════════════════════════════════════════════════════════════
// OPPORTUNITY SCHEMAS
// ═══════════════════════════════════════════════════════════════

export const createOpportunitySchema = z.object({
  leadId: z.string(),
  stage: z.enum(['NEW_LEAD', 'FIRST_CONTACT', 'VISIT_SCHEDULED', 'QUOTE_SENT', 'NEGOTIATION', 'CLOSED', 'LOST']),
  value: z.coerce.number().positive('Valor deve ser positivo'),
  probability: z.coerce.number().min(0).max(100, 'Probabilidade deve estar entre 0 e 100').default(10),
  responsibleId: z.string().optional(),
  expectedCloseDate: z.string().datetime().optional(),
  notes: z.string().optional(),
})

export type CreateOpportunityInput = z.infer<typeof createOpportunitySchema>

export const updateOpportunitySchema = createOpportunitySchema.extend({
  id: z.string(),
  status: z.enum(['OPEN', 'CLOSED_WON', 'CLOSED_LOST']).optional(),
  lossReasonId: z.string().optional(),
})

export type UpdateOpportunityInput = z.infer<typeof updateOpportunitySchema>

// ═══════════════════════════════════════════════════════════════
// ACTIVITY SCHEMAS
// ═══════════════════════════════════════════════════════════════

export const createActivitySchema = z.object({
  leadId: z.string().optional(),
  opportunityId: z.string().optional(),
  type: z.enum(['CALL', 'WHATSAPP', 'EMAIL', 'VISIT', 'MEETING', 'COLLECTION', 'NOTE']),
  title: z.string().min(3, 'Título obrigatório').max(255),
  description: z.string().optional(),
  result: z.string().optional(),
  nextAction: z.string().optional(),
  scheduledFor: z.string().datetime().optional(),
})

export type CreateActivityInput = z.infer<typeof createActivitySchema>

// ═══════════════════════════════════════════════════════════════
// REMINDER SCHEMAS
// ═══════════════════════════════════════════════════════════════

export const createReminderSchema = z.object({
  leadId: z.string().optional(),
  opportunityId: z.string().optional(),
  title: z.string().min(3).max(255),
  description: z.string().optional(),
  dueDate: z.string().datetime(),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).default('NORMAL'),
  assignedTo: z.string(),
})

export type CreateReminderInput = z.infer<typeof createReminderSchema>

// ═══════════════════════════════════════════════════════════════
// FILTERS SCHEMAS
// ═══════════════════════════════════════════════════════════════

export const leadFiltersSchema = z.object({
  search: z.string().optional(),
  source: z.enum(['INSTAGRAM', 'FACEBOOK', 'GOOGLE', 'INDICACAO', 'SITE', 'MARKETPLACE', 'OUTRO']).optional(),
  status: z.enum(['NEW', 'CONTACTED', 'QUALIFIED', 'UNQUALIFIED', 'CONVERTED', 'LOST']).optional(),
  responsibleId: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  page: z.coerce.number().default(1),
  limit: z.coerce.number().default(20),
})

export type LeadFilters = z.infer<typeof leadFiltersSchema>

export const opportunityFiltersSchema = z.object({
  search: z.string().optional(),
  stage: z.enum(['NEW_LEAD', 'FIRST_CONTACT', 'VISIT_SCHEDULED', 'QUOTE_SENT', 'NEGOTIATION', 'CLOSED', 'LOST']).optional(),
  status: z.enum(['OPEN', 'CLOSED_WON', 'CLOSED_LOST']).optional(),
  responsibleId: z.string().optional(),
  valueFrom: z.coerce.number().optional(),
  valueTo: z.coerce.number().optional(),
  page: z.coerce.number().default(1),
  limit: z.coerce.number().default(20),
})

export type OpportunityFilters = z.infer<typeof opportunityFiltersSchema>
