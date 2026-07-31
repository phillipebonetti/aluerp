/**
 * Tipos de Clientes
 * Consolidação centralizada de tipos relacionados a gestão de clientes
 */

export interface Client {
  id: string
  companyId: string
  name: string
  type: 'PESSOA_FISICA' | 'PESSOA_JURIDICA'
  document: string
  email?: string
  phone?: string
  whatsapp?: string
  website?: string
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
  category?: string
  mailingAddress?: string
  city?: string
  state?: string
  zipCode?: string
  country?: string
  notes?: string
  createdAt: Date
  updatedAt: Date
  deletedAt?: Date
}

export interface ClientContact {
  id: string
  clientId: string
  name: string
  email?: string
  phone?: string
  role?: string
  isPrimary: boolean
  createdAt: Date
  updatedAt: Date
}

export interface ClientAddress {
  id: string
  clientId: string
  type: 'BILLING' | 'SHIPPING' | 'CORRESPONDENCE'
  street: string
  number: string
  complement?: string
  neighborhood: string
  city: string
  state: string
  zipCode: string
  country: string
  isDefault: boolean
  createdAt: Date
  updatedAt: Date
}

export interface ClientWithRelations extends Client {
  contacts?: ClientContact[]
  addresses?: ClientAddress[]
}

export interface CreateClientPayload {
  name: string
  type: Client['type']
  document: string
  email?: string
  phone?: string
  whatsapp?: string
  website?: string
  category?: string
  mailingAddress?: string
  city?: string
  state?: string
  zipCode?: string
  country?: string
  notes?: string
}

export interface UpdateClientPayload {
  name?: string
  email?: string
  phone?: string
  whatsapp?: string
  website?: string
  category?: string
  mailingAddress?: string
  city?: string
  state?: string
  zipCode?: string
  country?: string
  notes?: string
  status?: Client['status']
}

export interface ClientFilters {
  search?: string
  status?: Client['status']
  type?: Client['type']
  category?: string
  city?: string
  state?: string
  createdAfter?: Date
  createdBefore?: Date
}

export interface ClientStats {
  totalClients: number
  activeClients: number
  inactiveClients: number
  byType: {
    fisica: number
    juridica: number
  }
  byCity: Record<string, number>
  byCategory: Record<string, number>
}
