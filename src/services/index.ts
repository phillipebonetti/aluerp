/**
 * Services compartilhados do AluERP.
 * Lógica de negócio reutilizável.
 * 
 * Cada service encapsula a lógica de negócio de um domínio específico.
 * Todos os acessos aos dados devem passar por esses services.
 */

// Core Services
export { AuthService } from './auth.service'
export type { AuthUser } from './auth.service'

export { FinancialService } from './financial.service'
export type { FinancialMetrics, CashFlowData } from './financial.service'

export { DashboardService } from './dashboard.service'
export type { DashboardData } from './dashboard.service'

// Domain Services
export { ClientService } from './client.service'
export { ProjectService } from './project.service'
export { SupplierService } from './supplier.service'
export { EmployeeService } from './employee.service'
export { BudgetService } from './budget.service'
export type { BudgetWithDetails } from './budget.service'

export { OSService } from './os.service'
export type { ServiceOrderWithDetails } from './os.service'

export { ReportService } from './report.service'

// Utility Services
export { AuditService } from './audit.service'
export { RolePermissionService } from './role-permission.service'
export { SettingsService } from './settings.service'
export { StorageService } from './storage.service'

// Factory para criar instâncias de services
export const createServices = () => ({
  auth: new AuthService(),
  financial: new FinancialService(),
  dashboard: new DashboardService(),
  client: new ClientService(),
  project: new ProjectService(),
  supplier: new SupplierService(),
  employee: new EmployeeService(),
  budget: new BudgetService(),
  os: new OSService(),
  report: new ReportService(),
  audit: new AuditService(),
  rolePermission: new RolePermissionService(),
  settings: new SettingsService(),
  storage: new StorageService(),
})
