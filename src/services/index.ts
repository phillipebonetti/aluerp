/**
 * Services compartilhados do AluERP.
 * Lógica de negócio reutilizável.
 */

export { FinancialService } from './financial.service'
export type { FinancialMetrics, CashFlowData } from './financial.service'

export { DashboardService } from './dashboard.service'
export type { DashboardData } from './dashboard.service'

export { ProjectService } from './project.service'

export { ClientService } from './client.service'

export { SupplierService } from './supplier.service'

export { EmployeeService } from './employee.service'

export { ReportService } from './report.service'

// Factory para criar instâncias de services
export const createServices = () => ({
  financial: new FinancialService(),
  dashboard: new DashboardService(),
  project: new ProjectService(),
  client: new ClientService(),
  supplier: new SupplierService(),
  employee: new EmployeeService(),
  report: new ReportService(),
})
