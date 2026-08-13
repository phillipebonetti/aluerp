import { NextRequest } from 'next/server'
import { z } from 'zod'
import { handleApiRequest, requireAuth, validateQuery, ApiError } from '@/src/api/middleware'
import { ApiResponses } from '@/src/api/utils/response'
import { ClientService } from '@/src/services'
import { AuthenticatedRequest } from '@/src/api/middleware/auth'

// Schema de validação para query params
const listClientsSchema = z.object({
  skip: z.string().optional().transform(v => v ? parseInt(v) : 0),
  take: z.string().optional().transform(v => v ? parseInt(v) : 10),
  search: z.string().optional(),
  status: z.string().optional(),
  category: z.string().optional(),
  city: z.string().optional(),
})

/**
 * GET /api/clientes
 * Lista clientes da empresa do usuário autenticado
 */
export async function GET(request: NextRequest) {
  return handleApiRequest(async (req) => {
    // Validar autenticação
    const authError = await requireAuth(req as AuthenticatedRequest)
    if (authError) return authError

    const authReq = req as AuthenticatedRequest
    if (!authReq.user) {
      return ApiResponses.unauthorized('Usuário não encontrado')
    }

    try {
      if (!process.env.DATABASE_URL) {
        return ApiResponses.success({ data: [], total: 0, skip: 0, take: 10 }, 'Banco de dados não configurado; nenhum cliente disponível')
      }

      // Validar query params
      const { searchParams } = new URL(req.url)
      const params = Object.fromEntries(searchParams)
      const validated = validateQuery(params, listClientsSchema)

      if (!validated) {
        return ApiResponses.badRequest('Parâmetros inválidos')
      }

      // Chamar service
      const clientService = new ClientService()
      const result = await clientService.list({
        companyId: authReq.user.companyId,
        skip: validated.skip,
        take: validated.take,
        search: validated.search,
        filters: {
          status: validated.status,
          category: validated.category,
          city: validated.city,
        },
      })

      return ApiResponses.success(result, 'Clientes listados com sucesso')
    } catch (error) {
      if (error instanceof ApiError) throw error
      throw new ApiError(500, 'Erro ao listar clientes')
    }
  }, request)
}

/**
 * POST /api/clientes
 * Cria novo cliente
 */
export async function POST(request: NextRequest) {
  return handleApiRequest(async (req) => {
    // Validar autenticação
    const authError = await requireAuth(req as AuthenticatedRequest)
    if (authError) return authError

    const authReq = req as AuthenticatedRequest
    if (!authReq.user) {
      return ApiResponses.unauthorized('Usuário não encontrado')
    }

    try {
      if (!process.env.DATABASE_URL) {
        return ApiResponses.internalServerError('Banco de dados não configurado para criar clientes')
      }

      const body = await req.json()

      const clientService = new ClientService()
      const newClient = await clientService.create({
        companyId: authReq.user.companyId,
        data: body,
      })

      return ApiResponses.created(newClient, 'Cliente criado com sucesso')
    } catch (error) {
      if (error instanceof ApiError) throw error
      throw new ApiError(400, 'Erro ao criar cliente')
    }
  }, request)
}
