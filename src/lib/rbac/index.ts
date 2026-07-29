// RBAC - Role-Based Access Control

export type Role = 'ADMIN' | 'FINANCEIRO' | 'VENDEDOR' | 'OPERACIONAL'

export type Resource = 'clients' | 'suppliers' | 'projects' | 'transactions' | 'employees' | 'reports' | 'settings' | 'users'

export type Action = 'create' | 'read' | 'update' | 'delete' | 'approve' | 'export'

export interface Permission {
  resource: Resource
  action: Action
}

export interface RolePermissions {
  [key in Role]: Permission[]
}

// Permissões padrão por role
export const ROLE_PERMISSIONS: RolePermissions = {
  ADMIN: [
    { resource: 'clients', action: 'create' },
    { resource: 'clients', action: 'read' },
    { resource: 'clients', action: 'update' },
    { resource: 'clients', action: 'delete' },
    { resource: 'suppliers', action: 'create' },
    { resource: 'suppliers', action: 'read' },
    { resource: 'suppliers', action: 'update' },
    { resource: 'suppliers', action: 'delete' },
    { resource: 'projects', action: 'create' },
    { resource: 'projects', action: 'read' },
    { resource: 'projects', action: 'update' },
    { resource: 'projects', action: 'delete' },
    { resource: 'transactions', action: 'create' },
    { resource: 'transactions', action: 'read' },
    { resource: 'transactions', action: 'update' },
    { resource: 'transactions', action: 'delete' },
    { resource: 'transactions', action: 'approve' },
    { resource: 'employees', action: 'create' },
    { resource: 'employees', action: 'read' },
    { resource: 'employees', action: 'update' },
    { resource: 'employees', action: 'delete' },
    { resource: 'reports', action: 'read' },
    { resource: 'reports', action: 'export' },
    { resource: 'settings', action: 'read' },
    { resource: 'settings', action: 'update' },
    { resource: 'users', action: 'create' },
    { resource: 'users', action: 'read' },
    { resource: 'users', action: 'update' },
    { resource: 'users', action: 'delete' },
  ],
  FINANCEIRO: [
    { resource: 'transactions', action: 'create' },
    { resource: 'transactions', action: 'read' },
    { resource: 'transactions', action: 'update' },
    { resource: 'transactions', action: 'approve' },
    { resource: 'reports', action: 'read' },
    { resource: 'reports', action: 'export' },
    { resource: 'clients', action: 'read' },
    { resource: 'suppliers', action: 'read' },
  ],
  VENDEDOR: [
    { resource: 'clients', action: 'create' },
    { resource: 'clients', action: 'read' },
    { resource: 'clients', action: 'update' },
    { resource: 'projects', action: 'create' },
    { resource: 'projects', action: 'read' },
    { resource: 'projects', action: 'update' },
    { resource: 'reports', action: 'read' },
  ],
  OPERACIONAL: [
    { resource: 'projects', action: 'read' },
    { resource: 'projects', action: 'update' },
    { resource: 'employees', action: 'read' },
    { resource: 'reports', action: 'read' },
  ],
}

// Rotas protegidas
export const PROTECTED_ROUTES: Record<string, Role[]> = {
  '/admin': ['ADMIN'],
  '/financeiro': ['ADMIN', 'FINANCEIRO'],
  '/vendas': ['ADMIN', 'VENDEDOR'],
  '/relatorios': ['ADMIN', 'FINANCEIRO', 'VENDEDOR'],
  '/operacoes': ['ADMIN', 'OPERACIONAL'],
}

export function hasPermission(role: Role, resource: Resource, action: Action): boolean {
  const permissions = ROLE_PERMISSIONS[role]
  return permissions.some(p => p.resource === resource && p.action === action)
}

export function hasAnyPermission(role: Role, permissions: Permission[]): boolean {
  return permissions.some(p => hasPermission(role, p.resource, p.action))
}

export function hasAllPermissions(role: Role, permissions: Permission[]): boolean {
  return permissions.every(p => hasPermission(role, p.resource, p.action))
}
