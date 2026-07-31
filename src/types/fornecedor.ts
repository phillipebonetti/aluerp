/**
 * Tipos de Fornecedores
 * Consolidação centralizada de tipos relacionados a gestão de fornecedores
 */

export type SupplierCategory = 'MATERIAL' | 'SERVICO' | 'EQUIPAMENTO' | 'OUTRO'
export type SupplierStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'BLOCKED'
export type PaymentTerms = 'IMMEDIATE' | 'NET_30' | 'NET_60' | 'NET_90' | 'CUSTOM'

export interface Supplier {
  id: string
  companyId: string
  name: string
  document: string
  email?: string
  phone?: string
  whatsapp?: string
  website?: string
  category: SupplierCategory
  status: SupplierStatus
  paymentTerms: PaymentTerms
  creditLimit?: number
  rating: number // 0-5
  notes?: string
  createdAt: Date
  updatedAt: Date
  deletedAt?: Date
}

export interface SupplierContact {
  id: string
  supplierId: string
  name: string
  email?: string
  phone?: string
  role?: string
  isPrimary: boolean
  createdAt: Date
}

export interface SupplierDocument {
  id: string
  supplierId: string
  type: 'CNPJ' | 'INSCRICAO_ESTADUAL' | 'CERTIFICADO' | 'OUTRO'
  number: string
  issuedAt?: Date
  expiresAt?: Date
  fileUrl?: string
  createdAt: Date
}

export interface SupplierRating {
  id: string
  supplierId: string
  companyId: string
  rating: number // 0-5
  comment?: string
  deliveryQuality: number
  communication: number
  pricingCompetitiveness: number
  ratedBy: string
  ratedAt: Date
}

export interface SupplierWithRelations extends Supplier {
  contacts?: SupplierContact[]
  documents?: SupplierDocument[]
  ratings?: SupplierRating[]
  averageRating?: number
}

export interface CreateSupplierPayload {
  name: string
  document: string
  email?: string
  phone?: string
  whatsapp?: string
  website?: string
  category: SupplierCategory
  paymentTerms?: PaymentTerms
  creditLimit?: number
  notes?: string
}

export interface UpdateSupplierPayload {
  name?: string
  email?: string
  phone?: string
  whatsapp?: string
  website?: string
  category?: SupplierCategory
  status?: SupplierStatus
  paymentTerms?: PaymentTerms
  creditLimit?: number
  notes?: string
}

export interface SupplierFilters {
  search?: string
  status?: SupplierStatus
  category?: SupplierCategory
  paymentTerms?: PaymentTerms
  minRating?: number
  maxRating?: number
}

export interface SupplierStats {
  totalSuppliers: number
  activeSuppliers: number
  inactiveSuppliers: number
  byCategory: Record<SupplierCategory, number>
  averageRating: number
  topRated: Supplier[]
  lowRated: Supplier[]
  byPaymentTerms: Record<PaymentTerms, number>
}

export interface SupplierPerformance {
  supplierId: string
  supplierName: string
  totalOrders: number
  completedOrders: number
  onTimeDelivery: number // percentage
  qualityScore: number
  priceIndex: number
  averageDeliveryDays: number
}
