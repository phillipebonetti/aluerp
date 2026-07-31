/**
 * Tipos globais do AluERP
 * Centralizados e compartilhados entre todos os módulos
 * 
 * Importar tipos específicos:
 * import type { Client, CreateClientPayload } from '@/src/types/cliente'
 * import type { Project } from '@/src/types/obra'
 */

// User and Authentication
export type { SessionUser, SessionCompany, AppSession, User, AuthUser, UserRole } from './usuario'
export type {
  LoginPayload,
  LoginResponse,
  RegisterPayload,
  UpdateProfilePayload,
  ChangePasswordPayload,
  CompanyMember,
  Role,
  Permission,
  RolePermission,
} from './usuario'

// Clients
export type {
  Client,
  ClientContact,
  ClientAddress,
  ClientWithRelations,
  CreateClientPayload,
  UpdateClientPayload,
  ClientFilters,
  ClientStats,
} from './cliente'

// Projects/Works
export type {
  Project,
  ProjectPhoto,
  ProjectDocument,
  ProjectCost,
  ProjectWithRelations,
  CreateProjectPayload,
  UpdateProjectPayload,
  ProjectFilters,
  ProjectStats,
  ProjectTimeline,
  ProjectStatus,
  ProjectPriority,
} from './obra'

// Suppliers
export type {
  Supplier,
  SupplierContact,
  SupplierDocument,
  SupplierRating,
  SupplierWithRelations,
  CreateSupplierPayload,
  UpdateSupplierPayload,
  SupplierFilters,
  SupplierStats,
  SupplierPerformance,
  SupplierCategory,
  SupplierStatus,
  PaymentTerms,
} from './fornecedor'

// Quotes/Budgets
export type {
  Quote,
  QuoteItem,
  QuoteWithItems,
  CreateQuotePayload,
  UpdateQuotePayload,
  QuoteFilters,
  QuoteStats,
  QuoteConversionPayload,
  QuoteTemplate,
  QuoteEmailPayload,
  QuoteStatus,
  QuoteSource,
} from './orcamento'

// Service Orders
export type {
  ServiceOrder,
  ServiceOrderItem,
  ServiceOrderAttachment,
  ServiceOrderUpdate,
  ServiceOrderWithRelations,
  CreateServiceOrderPayload,
  UpdateServiceOrderPayload,
  ServiceOrderFilters,
  ServiceOrderStats,
  TimeLog,
  ServiceOrderCompletion,
  OSWorkflow,
  ServiceOrderStatus,
  ServiceOrderPriority,
} from './os'

// Financial
export type {
  Account,
  Transaction,
  Invoice,
  RecurringTransaction,
  BankReconciliation,
  CreateTransactionPayload,
  UpdateTransactionPayload,
  TransactionFilters,
  FinancialStats,
  CashFlowData,
  FinancialReport,
  BudgetComparison,
  TransactionType,
  TransactionCategory,
  TransactionStatus,
  PaymentMethod,
} from './financeiro'

// Dashboard and Reports
export type {
  DashboardCard,
  DashboardStats,
  DashboardMetrics,
  ChartData,
  LineChartData,
  BarChartData,
  PieChartData,
  DashboardWidget,
  DashboardLayout,
  RevenueData,
  TopClientData,
  ProjectStatusBreakdown,
  EmployeePerformance,
  QuoteConversionFunnel,
  CashFlowProjection,
  ReportFilters,
  ExportReport,
} from './dashboard'
