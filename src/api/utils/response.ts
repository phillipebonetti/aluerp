import { NextResponse } from 'next/server'

export type ApiResponse<T = unknown> = {
  success: boolean
  data?: T
  error?: string
  message?: string
  statusCode: number
}

export const ApiResponses = {
  success: <T,>(data: T, message?: string, statusCode = 200) => 
    NextResponse.json(
      { success: true, data, message, statusCode },
      { status: statusCode }
    ),

  created: <T,>(data: T, message = 'Recurso criado com sucesso') =>
    NextResponse.json(
      { success: true, data, message, statusCode: 201 },
      { status: 201 }
    ),

  accepted: <T,>(data: T, message = 'Requisição aceita') =>
    NextResponse.json(
      { success: true, data, message, statusCode: 202 },
      { status: 202 }
    ),

  noContent: () =>
    NextResponse.json(
      { success: true, statusCode: 204 },
      { status: 204 }
    ),

  badRequest: (error: string, details?: unknown) =>
    NextResponse.json(
      { success: false, error, ...(details ? { details } : {}), statusCode: 400 },
      { status: 400 }
    ),

  unauthorized: (error = 'Não autenticado') =>
    NextResponse.json(
      { success: false, error, statusCode: 401 },
      { status: 401 }
    ),

  forbidden: (error = 'Acesso negado') =>
    NextResponse.json(
      { success: false, error, statusCode: 403 },
      { status: 403 }
    ),

  notFound: (error = 'Recurso não encontrado') =>
    NextResponse.json(
      { success: false, error, statusCode: 404 },
      { status: 404 }
    ),

  conflict: (error: string) =>
    NextResponse.json(
      { success: false, error, statusCode: 409 },
      { status: 409 }
    ),

  unprocessableEntity: (error: string) =>
    NextResponse.json(
      { success: false, error, statusCode: 422 },
      { status: 422 }
    ),

  internalServerError: (error = 'Erro interno do servidor') =>
    NextResponse.json(
      { success: false, error, statusCode: 500 },
      { status: 500 }
    ),
}
