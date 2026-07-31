/**
 * Tipos de Usuário e Autenticação
 * Consolidação centralizada de tipos relacionados a usuários
 */

// User Session Types
export interface SessionUser {
  id: string
  name: string
  email: string
  avatar: string | null
}

export interface SessionCompany {
  id: string
  name: string
  logo: string | null
  plan: string
  role: string
}

export interface AppSession {
  user: SessionUser
  company: SessionCompany
}

// User Database Types
export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  companyId: string
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
  createdAt: Date
  updatedAt: Date
}

export interface CompanyMember {
  id: string
  userId: string
  companyId: string
  role: string
  status: 'ACTIVE' | 'INACTIVE' | 'INVITED'
  joinedAt: Date
}

// Role and Permission Types
export interface Role {
  id: string
  companyId: string
  name: string
  description?: string
  isSystem: boolean
  createdAt: Date
}

export interface Permission {
  id: string
  resource: string
  action: string
  description?: string
  createdAt: Date
}

export interface RolePermission {
  id: string
  roleId: string
  permissionId: string
  createdAt: Date
}

// Auth Types
export interface AuthUser extends User {
  permissions: string[]
  roles: string[]
}

export interface LoginPayload {
  email: string
  password: string
}

export interface LoginResponse {
  user: AuthUser
  token: string
  refreshToken?: string
}

export interface RegisterPayload {
  name: string
  email: string
  password: string
  companyName: string
}

export interface UpdateProfilePayload {
  name?: string
  avatar?: string
  email?: string
}

export interface ChangePasswordPayload {
  currentPassword: string
  newPassword: string
}

export type UserRole = 'ADMIN' | 'MANAGER' | 'USER' | 'VIEWER'
