import { NextRequest } from 'next/server'
import { handleApiRequest, requireAuth, ApiError } from '@/src/api/middleware'
import { ApiResponses } from '@/src/api/utils/response'
import { AuthenticatedRequest } from '@/src/api/middleware/auth'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
]

/**
 * POST /api/upload
 * Upload de arquivos da empresa
 *
 * TODO: Implementar Vercel Blob ou storage de escolha
 */
export async function POST(request: NextRequest) {
  return handleApiRequest(async (req) => {
    const authError = await requireAuth(req as AuthenticatedRequest)
    if (authError) return authError

    const authReq = req as AuthenticatedRequest
    if (!authReq.user) {
      return ApiResponses.unauthorized('Usuário não encontrado')
    }

    try {
      const formData = await req.formData()
      const file = formData.get('file') as File | null

      if (!file) {
        return ApiResponses.badRequest('Nenhum arquivo enviado')
      }

      // Validar tamanho
      if (file.size > MAX_FILE_SIZE) {
        return ApiResponses.badRequest(`Arquivo maior que ${MAX_FILE_SIZE / 1024 / 1024}MB`)
      }

      // Validar tipo
      if (!ALLOWED_TYPES.includes(file.type)) {
        return ApiResponses.badRequest('Tipo de arquivo não permitido')
      }

      // TODO: Implementar upload real com Vercel Blob ou outro serviço
      // const url = await uploadToBlob(file, authReq.user.companyId)

      // Placeholder: retornar URL mockada
      const mockUrl = `/uploads/${authReq.user.companyId}/${Date.now()}-${file.name}`

      return ApiResponses.created(
        {
          url: mockUrl,
          name: file.name,
          size: file.size,
          type: file.type,
          uploadedAt: new Date(),
        },
        'Arquivo enviado com sucesso'
      )
    } catch (error) {
      if (error instanceof ApiError) throw error
      throw new ApiError(400, 'Erro ao fazer upload do arquivo')
    }
  }, request)
}
