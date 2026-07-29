/**
 * Repositories do AluERP.
 * Camada de acesso aos dados.
 */

export { BaseRepository } from './base.repository'
export type { RepositoryOptions } from './base.repository'

export { TransactionRepository } from './transaction.repository'
export type { TransactionWithRelations } from './transaction.repository'

export { ClientRepository } from './client.repository'
export type { ClientWithRelations } from './client.repository'

export { SupplierRepository } from './supplier.repository'
export type { SupplierWithRelations } from './supplier.repository'

export { ProjectRepository } from './project.repository'
export type { ProjectWithRelations } from './project.repository'

export { EmployeeRepository } from './employee.repository'
export type { EmployeeWithRelations } from './employee.repository'

// Factory para criar instâncias
export const createRepositories = () => ({
  transaction: new TransactionRepository(),
  client: new ClientRepository(),
  supplier: new SupplierRepository(),
  project: new ProjectRepository(),
  employee: new EmployeeRepository(),
})
