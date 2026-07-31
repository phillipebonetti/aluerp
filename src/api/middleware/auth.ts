import { NextRequest } from 'next/server'
import { prisma } from '@/src/core/database'
import { ApiResponses } from '../utils/response'

export interface AuthenticatedRequest extends NextRequest {
  userId?: string
  user?: {
    id: string
    email: string
    name?: string
    companyId: string
    role: string
    permissions: string[]
  }
}

/**
 * Middleware de autenticação para rotas API.
 * Valida token e carrega dados do usuário.
 */
export async function requireAuth(request: NextRequest) {
  try {
    // Extrair token do header Authorization
    const authHeader = request.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return ApiResponses.unauthorized('Token não fornecido')
    }

    const token = authHeader.slice(7)

    const userId = extractUserIdFromToken(token)
    if (!userId) {
      return ApiResponses.unauthorized('Token inválido')
    }

    // Carregar usuário com permissões
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: {
          include: {
            permissions: {
              select: { permission: true },
            },
          },
        },
      },
    })

    if (!user || user.deletedAt) {
      return ApiResponses.unauthorized('Usuário não encontrado')
    }

    // Adicionar dados do usuário ao request
    ;(request as AuthenticatedRequest).userId = user.id
    ;(request as AuthenticatedRequest).user = {
      id: user.id,
      email: user.email || '',
      name: user.name,
      companyId: user.companyId || '',
      role: user.role?.name || 'user',
      permissions: user.role?.permissions.map(p => p.permission.code) || [],
    }

    return null // Sucesso
  } catch (error) {
    console.error('[API] Auth error:', error)
    return ApiResponses.internalServerError('Erro ao autenticar')
  }
}

/**
 * Verifica se usuário tem permissão específica
 */
export function requirePermission(permission: string) {
  return (request: AuthenticatedRequest) => {
    const userPerms = request.user?.permissions || []
    if (!userPerms.includes(permission)) {
      return ApiResponses.forbidden(`Permissão requerida: ${permission}`)
    }
    return null
  }
}

/**
 * Verifica se usuário tem um dos papéis especificados
 */
export function requireRole(...roles: string[]) {
  return (request: AuthenticatedRequest) => {
    if (!roles.includes(request.user?.role || '')) {
      return ApiResponses.forbidden(`Papéis requeridos: ${roles.join(', ')}`)
    }
    return null
  }
}

/**
 * Extrai userId do token (implementar conforme seu auth setup)
 * TODO: Implementar validação real de token
 */
function extractUserIdFromToken(token: string): string | null {
  try {
    // Placeholder: decodificar JWT
    // Em produção, usar library JWT e validar assinatura
    const parts = token.split('.')
    if (parts.length !== 3) return null

    const payload = JSON.parse(
      Buffer.from(parts[1], 'base64').toString()
    )

    return payload.sub || payload.userId || null
  } catch (error) {
    console.error('[API] Token decode error:', error)
    return null
  }
}
