import { NextRequest } from 'next/server'
import { z } from 'zod'
import { handleApiRequest, requireAuth, validateQuery, ApiError } from '@/src/api/middleware'
import { ApiResponses } from '@/src/api/utils/response'
import { FinancialService } from '@/src/services'
import { AuthenticatedRequest } from '@/src/api/middleware/auth'

const listTransactionsSchema = z.object({
  skip: z.string().optional().transform(v => v ? parseInt(v) : 0),
  take: z.string().optional().transform(v => v ? parseInt(v) : 20),
  type: z.string().optional(),
  category: z.string().optional(),
  status: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
})

/**
 * GET /api/financeiro
 * Lista transações e dados financeiros
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
      if (new URL(req.url).searchParams.has('metrics')) {
        return ApiResponses.success({ revenue: 0, expenses: 0, profit: 0, balance: 0 }, 'Banco de dados não configurado; métricas vazias')
      }
      return ApiResponses.success({ data: [], total: 0, skip: 0, take: 20 }, 'Banco de dados não configurado; nenhuma transação disponível')
    }

    try {
      const { searchParams } = new URL(req.url)
      const params = Object.fromEntries(searchParams)

      // Se incluir /metrics, retornar apenas métricas
      if (searchParams.has('metrics')) {
        const financialService = new FinancialService()
        const metrics = await financialService.getMetrics(authReq.user.companyId)
        return ApiResponses.success(metrics, 'Métricas financeiras')
      }

      // Caso contrário, listar transações
      const validated = validateQuery(params, listTransactionsSchema)
      if (!validated) {
        return ApiResponses.badRequest('Parâmetros inválidos')
      }

      const financialService = new FinancialService()
      const result = await financialService.listTransactions({
        companyId: authReq.user.companyId,
        skip: validated.skip,
        take: validated.take,
        filters: {
          type: validated.type,
          category: validated.category,
          status: validated.status,
          startDate: validated.startDate,
          endDate: validated.endDate,
        },
      })

      return ApiResponses.success(result, 'Transações listadas com sucesso')
    } catch (error) {
      if (error instanceof ApiError) throw error
      throw new ApiError(500, 'Erro ao listar transações')
    }
  }, request)
}

/**
 * POST /api/financeiro
 * Cria nova transação
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
      return ApiResponses.internalServerError('Banco de dados não configurado para criar transações')
    }

    try {
      const body = await req.json()

      const financialService = new FinancialService()
      const newTransaction = await financialService.createTransaction({
        companyId: authReq.user.companyId,
        data: body,
      })

      return ApiResponses.created(newTransaction, 'Transação criada com sucesso')
    } catch (error) {
      if (error instanceof ApiError) throw error
      throw new ApiError(400, 'Erro ao criar transação')
    }
  }, request)
}
