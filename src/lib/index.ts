/**
 * Lib - Centralização de recursos compartilhados do AluERP
 * 
 * Consolida:
 * - Clientes de banco de dados (Prisma, Supabase)
 * - Autenticação e sessão
 * - Helpers e utilitários
 * - Funções compartilhadas
 * 
 * Importar:
 * import { getPrisma, createSupabaseClient, getSession } from '@/src/lib'
 */

// Banco de Dados
export { getPrisma } from '@/src/core/database'
export type { PrismaClient } from '@/src/core/database'

// Supabase
export { createClient as createSupabaseClient } from '@/src/core/supabase/client'
export { createClient as createSupabaseServerClient } from '@/src/core/supabase/server'

// Autenticação
export type { AppSession, SessionUser, SessionCompany } from '@/src/core/auth'
export { getSession, getCurrentUser, hasIdentity } from '@/src/core/auth'
export { setPreviewSession, getPreviewSessionUserId, clearPreviewSession } from '@/src/core/auth'

// Cache
export { createCacheKey, getCachedData, setCachedData, clearCache } from '@/src/core/cache'

// Erros
export { ApiError, ValidationError, NotFoundError, UnauthorizedError } from '@/src/core/errors'

// Logger
export { logger } from '@/src/core/logger'

// Middleware
export { authMiddleware, rateLimitMiddleware, errorMiddleware } from '@/src/core/middleware'

// Permissões
export { checkPermission, getUserPermissions, hasRole } from '@/src/core/permissions'

// Helpers
export { cn } from './utils'
export * from './pagination'
export * from './filters'
export * from './search'

// Validações
export * from './validations'

// Upload e Storage
export { uploadFile, deleteFile, getPublicUrl } from './upload'
export { getStorageClient, uploadToStorage } from './storage'

// Utilitários avançados
export { optimizeQuery, batchQuery } from './database/query-optimizer'
export { buildQuery, parseFilters } from './database/query-builder'
export { changeTracker } from './audit/change-tracker'
export { useRBAC } from './rbac'
