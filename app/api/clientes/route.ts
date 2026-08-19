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

const createClientSchema = z.object({
  name: z.string().trim().min(1, 'Nome do cliente é obrigatório').max(255, 'Nome do cliente é muito longo'),
  email: z.union([z.string().trim().email('E-mail inválido'), z.literal('')]).optional(),
  phone: z.string().trim().max(40, 'Telefone é muito longo').optional(),
  document: z.string().trim().max(40, 'Documento é muito longo').optional(),
  notes: z.string().trim().max(2000, 'Observações são muito longas').optional(),
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
      const body = await req.json()
      const parsed = createClientSchema.safeParse(body)
      if (!parsed.success) {
        return ApiResponses.badRequest(`Dados do cliente inválidos: ${Object.values(parsed.error.flatten().fieldErrors).flat().join('; ')}`)
      }

      const clientService = new ClientService()
      const newClient = await clientService.create({
        companyId: authReq.user.companyId,
        data: parsed.data,
      })

      return ApiResponses.created(newClient, 'Cliente criado com sucesso')
    } catch (error) {
      if (error instanceof ApiError) throw error
      const message = error instanceof Error ? error.message : 'Erro ao criar cliente'
      throw new ApiError(400, message)
    }
  }, request)
}
