/**
 * Contexts globais do AluERP
 * 
 * Gerenciam estado global da aplicação:
 * - AuthContext: Autenticação e sessão do usuário
 * - EmpresaContext: Dados e filtros da empresa ativa
 */

// Auth Context
export { AuthProvider, useAuth, usePermission, useRole } from './AuthContext'
export type { AuthUser, AuthContextType } from './AuthContext'

// Empresa Context
export {
  EmpresaProvider,
  useEmpresa,
  useGlobalFilters,
  useCompanyData,
  useCompanyPermissions,
} from './EmpresaContext'
export type {
  CompanyData,
  GlobalFilters,
  CompanyPermission,
  EmpresaContextType,
} from './EmpresaContext'
