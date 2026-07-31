/**
 * Constantes de Permissões e Controle de Acesso (RBAC)
 * Define roles, permissões e matrizes de acesso
 */

// Roles/Papéis da Aplicação
export const ROLES = {
  OWNER: 'OWNER',
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  EMPLOYEE: 'EMPLOYEE',
  VIEWER: 'VIEWER',
} as const

export const ROLE_LABELS = {
  OWNER: 'Proprietário',
  ADMIN: 'Administrador',
  MANAGER: 'Gerente',
  EMPLOYEE: 'Funcionário',
  VIEWER: 'Visualizador',
} as const

export const ROLE_DESCRIPTIONS = {
  OWNER: 'Controle total da empresa',
  ADMIN: 'Gerenciar usuários e configurações',
  MANAGER: 'Gerenciar obras e relatórios',
  EMPLOYEE: 'Executar trabalho',
  VIEWER: 'Apenas visualizar dados',
} as const

// Permissões do Sistema
export const PERMISSIONS = {
  // User Management
  USER_CREATE: 'user:create',
  USER_READ: 'user:read',
  USER_UPDATE: 'user:update',
  USER_DELETE: 'user:delete',
  USER_MANAGE: 'user:manage',

  // Company
  COMPANY_READ: 'company:read',
  COMPANY_UPDATE: 'company:update',
  COMPANY_DELETE: 'company:delete',
  COMPANY_MANAGE: 'company:manage',

  // Clients
  CLIENT_CREATE: 'client:create',
  CLIENT_READ: 'client:read',
  CLIENT_UPDATE: 'client:update',
  CLIENT_DELETE: 'client:delete',
  CLIENT_MANAGE: 'client:manage',

  // Projects
  PROJECT_CREATE: 'project:create',
  PROJECT_READ: 'project:read',
  PROJECT_UPDATE: 'project:update',
  PROJECT_DELETE: 'project:delete',
  PROJECT_MANAGE: 'project:manage',

  // Quotes
  QUOTE_CREATE: 'quote:create',
  QUOTE_READ: 'quote:read',
  QUOTE_UPDATE: 'quote:update',
  QUOTE_DELETE: 'quote:delete',
  QUOTE_MANAGE: 'quote:manage',

  // Service Orders
  OS_CREATE: 'os:create',
  OS_READ: 'os:read',
  OS_UPDATE: 'os:update',
  OS_DELETE: 'os:delete',
  OS_MANAGE: 'os:manage',

  // Financial
  FINANCIAL_READ: 'financial:read',
  FINANCIAL_UPDATE: 'financial:update',
  FINANCIAL_DELETE: 'financial:delete',
  FINANCIAL_MANAGE: 'financial:manage',

  // Suppliers
  SUPPLIER_CREATE: 'supplier:create',
  SUPPLIER_READ: 'supplier:read',
  SUPPLIER_UPDATE: 'supplier:update',
  SUPPLIER_DELETE: 'supplier:delete',
  SUPPLIER_MANAGE: 'supplier:manage',

  // Employees
  EMPLOYEE_CREATE: 'employee:create',
  EMPLOYEE_READ: 'employee:read',
  EMPLOYEE_UPDATE: 'employee:update',
  EMPLOYEE_DELETE: 'employee:delete',
  EMPLOYEE_MANAGE: 'employee:manage',

  // Reports
  REPORT_READ: 'report:read',
  REPORT_EXPORT: 'report:export',
  REPORT_MANAGE: 'report:manage',

  // Settings
  SETTINGS_READ: 'settings:read',
  SETTINGS_UPDATE: 'settings:update',
  SETTINGS_MANAGE: 'settings:manage',

  // Dashboard
  DASHBOARD_READ: 'dashboard:read',

  // Admin
  ADMIN_PANEL: 'admin:panel',
  ADMIN_MANAGE: 'admin:manage',
} as const

// Matriz de Permissões por Role
export const ROLE_PERMISSIONS: Record<keyof typeof ROLES, string[]> = {
  OWNER: Object.values(PERMISSIONS),

  ADMIN: [
    PERMISSIONS.USER_MANAGE,
    PERMISSIONS.COMPANY_UPDATE,
    PERMISSIONS.CLIENT_MANAGE,
    PERMISSIONS.PROJECT_MANAGE,
    PERMISSIONS.QUOTE_MANAGE,
    PERMISSIONS.OS_MANAGE,
    PERMISSIONS.FINANCIAL_MANAGE,
    PERMISSIONS.SUPPLIER_MANAGE,
    PERMISSIONS.EMPLOYEE_MANAGE,
    PERMISSIONS.REPORT_MANAGE,
    PERMISSIONS.SETTINGS_MANAGE,
    PERMISSIONS.DASHBOARD_READ,
    PERMISSIONS.ADMIN_PANEL,
  ],

  MANAGER: [
    PERMISSIONS.CLIENT_MANAGE,
    PERMISSIONS.PROJECT_MANAGE,
    PERMISSIONS.QUOTE_MANAGE,
    PERMISSIONS.OS_MANAGE,
    PERMISSIONS.FINANCIAL_READ,
    PERMISSIONS.SUPPLIER_READ,
    PERMISSIONS.EMPLOYEE_READ,
    PERMISSIONS.REPORT_READ,
    PERMISSIONS.DASHBOARD_READ,
  ],

  EMPLOYEE: [
    PERMISSIONS.CLIENT_READ,
    PERMISSIONS.PROJECT_READ,
    PERMISSIONS.QUOTE_READ,
    PERMISSIONS.OS_CREATE,
    PERMISSIONS.OS_UPDATE,
    PERMISSIONS.OS_READ,
    PERMISSIONS.DASHBOARD_READ,
  ],

  VIEWER: [
    PERMISSIONS.CLIENT_READ,
    PERMISSIONS.PROJECT_READ,
    PERMISSIONS.QUOTE_READ,
    PERMISSIONS.OS_READ,
    PERMISSIONS.FINANCIAL_READ,
    PERMISSIONS.SUPPLIER_READ,
    PERMISSIONS.REPORT_READ,
    PERMISSIONS.DASHBOARD_READ,
  ],
} as const

// Hierarquia de Roles (OWNER > ADMIN > MANAGER > EMPLOYEE > VIEWER)
export const ROLE_HIERARCHY = {
  OWNER: 5,
  ADMIN: 4,
  MANAGER: 3,
  EMPLOYEE: 2,
  VIEWER: 1,
} as const

// Rações que podem gerenciar usuários
export const CAN_MANAGE_USERS = [ROLES.OWNER, ROLES.ADMIN] as const

// Roles que podem acessar admin panel
export const CAN_ACCESS_ADMIN = [ROLES.OWNER, ROLES.ADMIN] as const

// Roles que podem gerenciar empresa
export const CAN_MANAGE_COMPANY = [ROLES.OWNER] as const

// Roles que podem exportar relatórios
export const CAN_EXPORT_REPORTS = [ROLES.OWNER, ROLES.ADMIN, ROLES.MANAGER] as const
