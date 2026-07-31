import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { ApiResponses } from '../utils/response'

export class ApiError extends Error {
  constructor(
    public statusCode: number = 500,
    public message: string = 'Erro interno do servidor',
    public details?: any
  ) {
    super(message)
  }
}

/**
 * Wrapper para executar handlers de API com error handling
 */
export async function handleApiRequest<T>(
  handler: (req: NextRequest) => Promise<NextResponse<T>>,
  request: NextRequest
): Promise<NextResponse<T>> {
  try {
    return await handler(request)
  } catch (error) {
    console.error('[API] Error:', error)
    return handleApiError(error) as NextResponse<T>
  }
}

/**
 * Tratamento centralizado de erros de API
 */
export function handleApiError(error: unknown): NextResponse {
  // Erro customizado da API
  if (error instanceof ApiError) {
    if (error.statusCode === 400) {
      return ApiResponses.badRequest(error.message)
    }
    if (error.statusCode === 401) {
      return ApiResponses.unauthorized(error.message)
    }
    if (error.statusCode === 403) {
      return ApiResponses.forbidden(error.message)
    }
    if (error.statusCode === 404) {
      return ApiResponses.notFound(error.message)
    }
    if (error.statusCode === 409) {
      return ApiResponses.conflict(error.message)
    }
    if (error.statusCode === 422) {
      return ApiResponses.unprocessableEntity(error.message)
    }
  }

  // Erros do Prisma
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      const field = (error.meta?.target as string[])?.[0] || 'campo'
      return ApiResponses.conflict(`${field} já existe`)
    }
    if (error.code === 'P2025') {
      return ApiResponses.notFound('Recurso não encontrado')
    }
    if (error.code === 'P2003') {
      return ApiResponses.unprocessableEntity('Referência inválida')
    }
  }

  // Erros de validação
  if (error instanceof SyntaxError && 'body' in error) {
    return ApiResponses.badRequest('JSON inválido no corpo da requisição')
  }

  // Erro genérico
  if (error instanceof Error) {
    console.error('[API] Unhandled error:', error.message)
    return ApiResponses.internalServerError(error.message)
  }

  return ApiResponses.internalServerError('Erro desconhecido')
}

/**
 * Wrapper type-safe para rotas GET
 */
export async function GET(
  request: NextRequest,
  handler: (req: NextRequest) => Promise<NextResponse>
): Promise<NextResponse> {
  return handleApiRequest(handler, request)
}

/**
 * Wrapper type-safe para rotas POST
 */
export async function POST(
  request: NextRequest,
  handler: (req: NextRequest) => Promise<NextResponse>
): Promise<NextResponse> {
  return handleApiRequest(handler, request)
}

/**
 * Wrapper type-safe para rotas PUT
 */
export async function PUT(
  request: NextRequest,
  handler: (req: NextRequest) => Promise<NextResponse>
): Promise<NextResponse> {
  return handleApiRequest(handler, request)
}

/**
 * Wrapper type-safe para rotas DELETE
 */
export async function DELETE(
  request: NextRequest,
  handler: (req: NextRequest) => Promise<NextResponse>
): Promise<NextResponse> {
  return handleApiRequest(handler, request)
}

/**
 * Wrapper type-safe para rotas PATCH
 */
export async function PATCH(
  request: NextRequest,
  handler: (req: NextRequest) => Promise<NextResponse>
): Promise<NextResponse> {
  return handleApiRequest(handler, request)
}
