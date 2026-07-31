/**
 * Tipos de Dashboard
 * Consolidação centralizada de tipos relacionados a dashboard e relatórios
 */

export interface DashboardCard {
  title: string
  value: number | string
  icon?: string
  trend?: {
    direction: 'UP' | 'DOWN' | 'NEUTRAL'
    percent: number
  }
  color?: string
  onClick?: () => void
}

export interface DashboardStats {
  // Clientes
  totalClients: number
  newClientsThisMonth: number
  activeClients: number
  clientsByCity: Record<string, number>

  // Obras
  totalProjects: number
  activeProjects: number
  completedProjects: number
  projectsByStatus: Record<string, number>

  // Orçamentos
  totalQuotes: number
  quoteValue: number
  conversionRate: number
  acceptedQuotes: number

  // OS
  totalServiceOrders: number
  openServiceOrders: number
  completedServiceOrders: number
  overduServiceOrders: number

  // Financeiro
  totalIncome: number
  totalExpense: number
  netIncome: number
  cashBalance: number
  accountsReceivable: number
  accountsPayable: number

  // Fornecedores
  totalSuppliers: number
  activeSuppliers: number
  topSuppliers: Array<{ id: string; name: string; rating: number }>
}

export interface DashboardMetrics {
  // Performance indicators
  projectSuccessRate: number
  quoteAcceptanceRate: number
  onTimeDeliveryRate: number
  customerSatisfactionScore: number

  // Timeframe
  period: 'TODAY' | 'THIS_WEEK' | 'THIS_MONTH' | 'THIS_QUARTER' | 'THIS_YEAR' | 'CUSTOM'
  startDate: Date
  endDate: Date

  // Comparisons
  vsLastPeriod: {
    income: number
    expense: number
    projectsCompleted: number
  }
}

export interface ChartData {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    borderColor?: string
    backgroundColor?: string
  }[]
}

export interface LineChartData extends ChartData {
  borderColor: string
  tension?: number
  fill?: boolean
}

export interface BarChartData extends ChartData {
  backgroundColor: string
}

export interface PieChartData {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    backgroundColor: string[]
  }[]
}

export interface DashboardWidget {
  id: string
  type: 'METRIC_CARD' | 'LINE_CHART' | 'BAR_CHART' | 'PIE_CHART' | 'TABLE' | 'LIST'
  title: string
  position: {
    x: number
    y: number
    width: number
    height: number
  }
  data: any
  refreshInterval?: number
  isLoading?: boolean
  error?: string
}

export interface DashboardLayout {
  id: string
  companyId: string
  name: string
  widgets: DashboardWidget[]
  isDefault: boolean
  createdAt: Date
  updatedAt: Date
}

export interface RevenueData {
  date: Date
  revenue: number
  expense: number
  profit: number
}

export interface TopClientData {
  id: string
  name: string
  totalSpent: number
  projectsCount: number
  lastOrderDate: Date
}

export interface ProjectStatusBreakdown {
  status: string
  count: number
  percentage: number
  projects: Array<{ id: string; name: string }>
}

export interface EmployeePerformance {
  employeeId: string
  employeeName: string
  projectsCompleted: number
  revenue: number
  clientSatisfaction: number
  hoursLogged: number
}

export interface QuoteConversionFunnel {
  stage: string
  count: number
  percentage: number
  conversionToNext: number
}

export interface CashFlowProjection {
  date: Date
  projectedIncome: number
  projectedExpense: number
  projectedBalance: number
}

export interface ReportFilters {
  companyId?: string
  startDate: Date
  endDate: Date
  groupBy?: 'DAY' | 'WEEK' | 'MONTH' | 'QUARTER' | 'YEAR'
  categories?: string[]
  clients?: string[]
  suppliers?: string[]
  projects?: string[]
  employees?: string[]
}

export interface ExportReport {
  format: 'PDF' | 'EXCEL' | 'CSV'
  title: string
  data: any
  filters: ReportFilters
}
