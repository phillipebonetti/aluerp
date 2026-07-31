import { NextRequest } from 'next/server'
import { z } from 'zod'
import { handleApiRequest, requireAuth, validateQuery, ApiError } from '@/src/api/middleware'
import { ApiResponses } from '@/src/api/utils/response'
import { ReportService } from '@/src/services'
import { AuthenticatedRequest } from '@/src/api/middleware/auth'

const reportsSchema = z.object({
  type: z.enum([
    'clients',
    'projects',
    'financial',
    'suppliers',
    'budgets',
    'serviceorders',
  ]),
  format: z.enum(['json', 'pdf', 'csv']).optional().default('json'),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
})

/**
 * GET /api/relatorios?type=financial&format=pdf&startDate=2024-01-01&endDate=2024-12-31
 * Gera e retorna relatórios
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
      const { searchParams } = new URL(req.url)
      const params = Object.fromEntries(searchParams)
      const validated = validateQuery(params, reportsSchema)

      if (!validated) {
        return ApiResponses.badRequest('Parâmetros de relatório inválidos')
      }

      const reportService = new ReportService()
      const report = await reportService.generateReport({
        companyId: authReq.user.companyId,
        type: validated.type,
        format: validated.format,
        startDate: validated.startDate,
        endDate: validated.endDate,
      })

      // Se for PDF ou CSV, retornar como arquivo
      if (validated.format === 'pdf') {
        return new Response(report.data, {
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="relatorio-${validated.type}.pdf"`,
          },
        })
      }

      if (validated.format === 'csv') {
        return new Response(report.data, {
          headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': `attachment; filename="relatorio-${validated.type}.csv"`,
          },
        })
      }

      // Caso contrário, retornar como JSON
      return ApiResponses.success(report, 'Relatório gerado com sucesso')
    } catch (error) {
      if (error instanceof ApiError) throw error
      throw new ApiError(500, 'Erro ao gerar relatório')
    }
  }, request)
}
