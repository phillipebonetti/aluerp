/**
 * Custom hooks do AluERP.
 * Reutilizáveis entre componentes.
 * 
 * Cada hook gerencia estado e operações de um domínio específico.
 * Todos integram com os Services correspondentes via Server Actions.
 */

// Utility Hooks
export { useCache, useMultiCache, clearCache, getCacheSize } from './useCache'
export { useStandardForm, useFormState, useMaskedInput } from './useForm'
export { useLazyLoad } from './useLazyLoad'
export { useMemoize } from './useMemoize'
export { useCompanySettings } from './useCompanySettings'

// Domain Hooks - Business Logic
export { useClientes } from './useClientes'
export { useObras } from './useObras'
export { useFinanceiro } from './useFinanceiro'
export { useFornecedores } from './useFornecedores'
export { useOrcamentos } from './useOrcamentos'
export { useOS } from './useOS'

// CRM Hooks
export { useLeadFilters, usePipeline } from './crm'
