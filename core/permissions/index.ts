// Core Permissions Module
// =======================
// RBAC (Role-Based Access Control) - Implementar depois
// Tipos: OWNER, ADMIN, MANAGER, TECHNICIAN, ACCOUNTANT, VIEWER

export type Role = 'OWNER' | 'ADMIN' | 'MANAGER' | 'TECHNICIAN' | 'ACCOUNTANT' | 'VIEWER'

export type Permission = 
  | 'read'
  | 'create'
  | 'update'
  | 'delete'
  | 'approve'
  | 'export'

// Implementar: checkPermission(), hasRole(), middleware, etc
