import { NextRequest } from 'next/server'
import { handleApiRequest, requireAuth, ApiError } from '@/src/api/middleware'
import { ApiResponses } from '@/src/api/utils/response'
import { DashboardService } from '@/src/services'
import { AuthenticatedRequest } from '@/src/api/middleware/auth'

/**
 * GET /api/dashboard
 * Retorna dados agregados do dashboard
 */
export async function GET(request: NextRequest) {
  return handleApiRequest(async (req) => {
    const authError = await requireAuth(req as AuthenticatedRequest)
    if (authError) return authError

    const authReq = req as AuthenticatedRequest
    if (!authReq.user) {
      return ApiResponses.unauthorized('Usuário não encontrado')
    }

    try {
      const dashboardService = new DashboardService()
      const dashboardData = await dashboardService.getDashboardData(
        authReq.user.companyId
      )

      return ApiResponses.success(dashboardData, 'Dados do dashboard')
    } catch (error) {
      if (error instanceof ApiError) throw error
      throw new ApiError(500, 'Erro ao carregar dashboard')
    }
  }, request)
}
