'use server'

import { NextRequest } from 'next/server'
import { ClientService } from '@/src/services'
import { handleApiRequest, requireAuth } from '@/src/api/middleware'
import { AuthenticatedRequest } from '@/src/api/middleware/auth'
import { ApiResponses } from '@/src/api/utils/response'

type RouteContext = { params: Promise<{ id: string }> }

export async function PATCH(request: NextRequest, context: RouteContext) {
  return handleApiRequest(async (req) => {
    const authError = await requireAuth(req as AuthenticatedRequest)
    if (authError) return authError
    const authReq = req as AuthenticatedRequest
    if (!authReq.user) return ApiResponses.unauthorized('Usuário não encontrado')
    const { id } = await context.params
    const client = await new ClientService().update(id, authReq.user.companyId, await req.json())
    if (!client) return ApiResponses.notFound('Cliente não encontrado')
    return ApiResponses.success(client, 'Cliente atualizado com sucesso')
  }, request)
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  return handleApiRequest(async (req) => {
    const authError = await requireAuth(req as AuthenticatedRequest)
    if (authError) return authError
    const authReq = req as AuthenticatedRequest
    if (!authReq.user) return ApiResponses.unauthorized('Usuário não encontrado')
    const { id } = await context.params
    const client = await new ClientService().remove(id, authReq.user.companyId)
    if (!client) return ApiResponses.notFound('Cliente não encontrado')
    return ApiResponses.success(client, 'Cliente removido com sucesso')
  }, request)
}
