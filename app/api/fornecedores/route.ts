import { NextRequest } from 'next/server'
import { z } from 'zod'
import { handleApiRequest, requireAuth, ApiError } from '@/src/api/middleware'
import { ApiResponses } from '@/src/api/utils/response'
import { SupplierRepository } from '@/src/repositories'
import { AuthenticatedRequest } from '@/src/api/middleware/auth'

const supplierSchema = z.object({
  name: z.string().trim().min(2),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  document: z.string().optional(),
  type: z.enum(['MATERIAL', 'SERVICE', 'OTHER']).optional(),
})

export async function GET(request: NextRequest) {
  return handleApiRequest(async (req) => {
    const authError = await requireAuth(req as AuthenticatedRequest)
    if (authError) return authError
    const authReq = req as AuthenticatedRequest
    if (!authReq.user) return ApiResponses.unauthorized('Usuário não encontrado')
    if (!process.env.DATABASE_URL) {
      return ApiResponses.success([], 'Banco de dados não configurado; nenhum fornecedor disponível')
    }
    const suppliers = await new SupplierRepository().findAll({ companyId: authReq.user.companyId })
    return ApiResponses.success(suppliers, 'Fornecedores listados com sucesso')
  }, request)
}

export async function POST(request: NextRequest) {
  return handleApiRequest(async (req) => {
    const authError = await requireAuth(req as AuthenticatedRequest)
    if (authError) return authError
    const authReq = req as AuthenticatedRequest
    if (!authReq.user) return ApiResponses.unauthorized('Usuário não encontrado')
    if (!process.env.DATABASE_URL) {
      return ApiResponses.internalServerError('Banco de dados não configurado para criar fornecedores')
    }
    const parsed = supplierSchema.safeParse(await req.json())
    if (!parsed.success) throw new ApiError(400, 'Dados do fornecedor inválidos')
    const supplier = await new SupplierRepository().create({
      companyId: authReq.user.companyId,
      ...parsed.data,
      email: parsed.data.email || null,
      type: parsed.data.type ?? 'MATERIAL',
      documentType: 'CNPJ',
      status: 'ACTIVE',
      notes: null,
      paymentTerms: null,
      deletedAt: null,
    } as never)
    return ApiResponses.created(supplier, 'Fornecedor criado com sucesso')
  }, request)
}
