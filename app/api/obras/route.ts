import { NextRequest } from 'next/server'
import { z } from 'zod'
import { handleApiRequest, requireAuth, validateQuery, ApiError } from '@/src/api/middleware'
import { ApiResponses } from '@/src/api/utils/response'
import { ProjectService } from '@/src/services'
import { AuthenticatedRequest } from '@/src/api/middleware/auth'

const listProjectsSchema = z.object({
  skip: z.string().optional().transform(v => v ? parseInt(v) : 0),
  take: z.string().optional().transform(v => v ? parseInt(v) : 10),
  search: z.string().optional(),
  status: z.string().optional(),
  clientId: z.string().optional(),
  priority: z.string().optional(),
})

/**
 * GET /api/obras
 * Lista obras da empresa do usuário autenticado
 */
export async function GET(request: NextRequest) {
  return handleApiRequest(async (req) => {
    const authError = await requireAuth(req as AuthenticatedRequest)
    if (authError) return authError

    const authReq = req as AuthenticatedRequest
    if (!authReq.user) {
      return ApiResponses.unauthorized('Usuário não encontrado')
    }
    if (!process.env.DATABASE_URL) {
      return ApiResponses.success({ data: [], total: 0, skip: 0, take: 10 }, 'Banco de dados não configurado; nenhuma obra disponível')
    }

    try {
      const { searchParams } = new URL(req.url)
      const params = Object.fromEntries(searchParams)
      const validated = validateQuery(params, listProjectsSchema)

      if (!validated) {
        return ApiResponses.badRequest('Parâmetros inválidos')
      }

      const projectService = new ProjectService()
      const result = await projectService.list({
        companyId: authReq.user.companyId,
        skip: validated.skip,
        take: validated.take,
        search: validated.search,
        filters: {
          status: validated.status,
          clientId: validated.clientId,
          priority: validated.priority,
        },
      })

      return ApiResponses.success(result, 'Obras listadas com sucesso')
    } catch (error) {
      if (error instanceof ApiError) throw error
      throw new ApiError(500, 'Erro ao listar obras')
    }
  }, request)
}

/**
 * POST /api/obras
 * Cria nova obra
 */
export async function POST(request: NextRequest) {
  return handleApiRequest(async (req) => {
    const authError = await requireAuth(req as AuthenticatedRequest)
    if (authError) return authError

    const authReq = req as AuthenticatedRequest
    if (!authReq.user) {
      return ApiResponses.unauthorized('Usuário não encontrado')
    }
    if (!process.env.DATABASE_URL) {
      return ApiResponses.internalServerError('Banco de dados não configurado para criar obras')
    }

    try {
      const body = await req.json()

      const projectService = new ProjectService()
      const newProject = await projectService.create({
        companyId: authReq.user.companyId,
        data: body,
      })

      return ApiResponses.created(newProject, 'Obra criada com sucesso')
    } catch (error) {
      if (error instanceof ApiError) throw error
      throw new ApiError(400, 'Erro ao criar obra')
    }
  }, request)
}
