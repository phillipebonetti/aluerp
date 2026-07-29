import { z } from 'zod'

/**
 * Schemas de validação para formulários
 * Utilizam Zod para validação de dados
 */

// Base schemas reutilizáveis
const brazilianCPF = z.string().regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, 'CPF inválido')
const brazilianCNPJ = z.string().regex(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/, 'CNPJ inválido')
const brazilianPhone = z.string().regex(/^\(\d{2}\)\s\d{4,5}-\d{4}$/, 'Telefone inválido')
const currency = z.coerce.number().positive('Valor deve ser positivo')
const percentage = z.coerce.number().min(0).max(100, 'Percentual deve estar entre 0 e 100')

// Cliente
export const clienteFormSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres').max(255),
  email: z.string().email('Email inválido'),
  phone: brazilianPhone,
  cpf: brazilianCPF.optional().or(z.literal('')),
  cnpj: brazilianCNPJ.optional().or(z.literal('')),
  address: z.string().min(5, 'Endereço inválido'),
  number: z.string().min(1),
  complement: z.string().optional(),
  neighborhood: z.string().min(2),
  city: z.string().min(2),
  state: z.string().length(2),
  zipCode: z.string().regex(/^\d{5}-\d{3}$/, 'CEP inválido'),
  notes: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'ARCHIVED']).default('ACTIVE'),
})

export type ClienteFormData = z.infer<typeof clienteFormSchema>

// Fornecedor
export const fornecedorFormSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres').max(255),
  email: z.string().email('Email inválido'),
  phone: brazilianPhone,
  cnpj: brazilianCNPJ,
  address: z.string().min(5),
  number: z.string().min(1),
  complement: z.string().optional(),
  neighborhood: z.string().min(2),
  city: z.string().min(2),
  state: z.string().length(2),
  zipCode: z.string().regex(/^\d{5}-\d{3}$/, 'CEP inválido'),
  bankAccount: z.string().optional(),
  paymentTerms: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'ARCHIVED']).default('ACTIVE'),
})

export type FornecedorFormData = z.infer<typeof fornecedorFormSchema>

// Obra/Projeto
export const obraFormSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  description: z.string().optional(),
  clientId: z.string().min(1, 'Cliente é obrigatório'),
  address: z.string().min(5),
  number: z.string().min(1),
  complement: z.string().optional(),
  neighborhood: z.string().min(2),
  city: z.string().min(2),
  state: z.string().length(2),
  zipCode: z.string().regex(/^\d{5}-\d{3}$/, 'CEP inválido'),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  budget: currency,
  status: z.enum(['PLANNING', 'IN_PROGRESS', 'COMPLETED', 'SUSPENDED', 'CANCELLED']),
  notes: z.string().optional(),
})

export type ObraFormData = z.infer<typeof obraFormSchema>

// Receita
export const receitaFormSchema = z.object({
  id: z.string().optional(),
  description: z.string().min(3, 'Descrição obrigatória'),
  amount: currency,
  date: z.coerce.date(),
  dueDate: z.coerce.date().optional(),
  category: z.enum(['SERVICE', 'PRODUCT', 'RENTAL', 'OTHER']),
  clientId: z.string().optional(),
  projectId: z.string().optional(),
  paymentMethod: z.enum(['CASH', 'CHECK', 'TRANSFER', 'CREDIT_CARD', 'PIX']),
  status: z.enum(['PENDING', 'PAID', 'OVERDUE', 'CANCELLED']).default('PENDING'),
  notes: z.string().optional(),
})

export type ReceitaFormData = z.infer<typeof receitaFormSchema>

// Despesa
export const despesaFormSchema = z.object({
  id: z.string().optional(),
  description: z.string().min(3, 'Descrição obrigatória'),
  amount: currency,
  date: z.coerce.date(),
  dueDate: z.coerce.date().optional(),
  category: z.enum(['MATERIAL', 'LABOR', 'EQUIPMENT', 'TRANSPORT', 'OTHER']),
  supplierId: z.string().optional(),
  projectId: z.string().optional(),
  paymentMethod: z.enum(['CASH', 'CHECK', 'TRANSFER', 'CREDIT_CARD', 'PIX']),
  status: z.enum(['PENDING', 'PAID', 'OVERDUE', 'CANCELLED']).default('PENDING'),
  notes: z.string().optional(),
})

export type DespesaFormData = z.infer<typeof despesaFormSchema>

// Orçamento
export const orcamentoFormSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(3, 'Título obrigatório'),
  description: z.string().optional(),
  clientId: z.string().min(1, 'Cliente obrigatório'),
  projectId: z.string().optional(),
  items: z.array(
    z.object({
      description: z.string().min(1),
      quantity: z.coerce.number().positive(),
      unitPrice: currency,
      discount: percentage.default(0),
    })
  ).min(1, 'Adicione pelo menos um item'),
  validUntil: z.coerce.date(),
  discount: percentage.default(0),
  notes: z.string().optional(),
  status: z.enum(['DRAFT', 'SENT', 'ACCEPTED', 'REJECTED', 'EXPIRED']).default('DRAFT'),
})

export type OrcamentoFormData = z.infer<typeof orcamentoFormSchema>

// Ordem de Serviço
export const osFormSchema = z.object({
  id: z.string().optional(),
  number: z.string().min(1),
  clientId: z.string().min(1, 'Cliente obrigatório'),
  projectId: z.string().optional(),
  description: z.string().min(5),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional(),
  estimatedHours: z.coerce.number().positive('Horas devem ser positivas').optional(),
  assignedTo: z.string().min(1, 'Responsável obrigatório'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).default('PENDING'),
  notes: z.string().optional(),
})

export type OSFormData = z.infer<typeof osFormSchema>

// Configurações
export const configuracoesFormSchema = z.object({
  companyName: z.string().min(3, 'Nome da empresa obrigatório'),
  email: z.string().email('Email inválido'),
  phone: brazilianPhone,
  address: z.string().min(5),
  number: z.string().min(1),
  complement: z.string().optional(),
  neighborhood: z.string().min(2),
  city: z.string().min(2),
  state: z.string().length(2),
  zipCode: z.string().regex(/^\d{5}-\d{3}$/, 'CEP inválido'),
  cnpj: brazilianCNPJ.optional(),
  logo: z.instanceof(File).optional(),
  timezone: z.string().default('America/Sao_Paulo'),
  dateFormat: z.enum(['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD']).default('DD/MM/YYYY'),
  currencySymbol: z.string().default('R$'),
})

export type ConfiguracoesFormData = z.infer<typeof configuracoesFormSchema>

// Configurações da Empresa (CompanySetting)
export const companySettingsSchema = z.object({
  // Dados da empresa
  razaoSocial: z.string().min(3, 'Razão social obrigatória').optional(),
  cnpj: brazilianCNPJ.optional().or(z.literal('')),
  logo: z.instanceof(File).optional(),
  
  // Contato
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  whatsapp: brazilianPhone.optional().or(z.literal('')),
  
  // Financeiro
  comissaoPercentual: percentage.optional(),
  impostoPercentual: percentage.optional(),
  
  // Horários
  horarioAbertura: z.string().regex(/^\d{2}:\d{2}$/, 'Formato de hora inválido').optional(),
  horarioFechamento: z.string().regex(/^\d{2}:\d{2}$/, 'Formato de hora inválido').optional(),
  
  // Metas
  metaVendas: currency.optional(),
  metaClientes: currency.optional(),
  
  // Numeração automática
  proximoNumeroOS: z.coerce.number().int().min(1).optional(),
  proximoNumeroOrcamento: z.coerce.number().int().min(1).optional(),
  proximoNumeroNota: z.coerce.number().int().min(1).optional(),
  
  // Assinaturas e documentos
  assinaturaPadrao: z.instanceof(File).optional(),
  carimboNota: z.instanceof(File).optional(),
  rodapePadrao: z.string().optional(),
})

export type CompanySettingsData = z.infer<typeof companySettingsSchema>
