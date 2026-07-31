/**
 * Middlewares da API
 * Reutilizáveis em todas as rotas
 */

export { requireAuth, requirePermission, requireRole } from './auth'
export type { AuthenticatedRequest } from './auth'

export { validateRequest, validateBody, validateQuery } from './validation'

export { ApiError, handleApiRequest, handleApiError, GET, POST, PUT, DELETE, PATCH } from './errorHandler'
