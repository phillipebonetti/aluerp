import { ZodSchema } from 'zod'
import { ApiResponses } from '../utils/response'

/**
 * Valida dados contra schema Zod
 */
export async function validateRequest<T>(
  data: unknown,
  schema: ZodSchema<T>
): Promise<{ valid: true; data: T } | { valid: false; error: string }> {
  try {
    const validated = schema.parse(data)
    return { valid: true, data: validated }
  } catch (error: any) {
    const message = error.errors?.[0]?.message || error.message || 'Validação falhou'
    return { valid: false, error: message }
  }
}

/**
 * Wrapper para validar request body com Zod
 */
export async function validateBody<T>(
  request: Request,
  schema: ZodSchema<T>
): Promise<T | null> {
  try {
    const body = await request.json()
    const result = await validateRequest(body, schema)

    if (!result.valid) {
      throw new Error(result.error)
    }

    return result.data
  } catch (error) {
    throw ApiResponses.badRequest(
      `Validação falhou: ${(error as Error).message}`
    )
  }
}

/**
 * Wrapper para validar query params
 */
export function validateQuery<T>(
  params: Record<string, any>,
  schema: ZodSchema<T>
): T | null {
  try {
    const result = schema.safeParse(params)

    if (!result.success) {
      const message = result.error.errors?.[0]?.message || 'Validação de query falhou'
      throw ApiResponses.badRequest(message)
    }

    return result.data
  } catch (error) {
    if (error instanceof Response) throw error
    throw ApiResponses.badRequest('Erro ao validar parâmetros')
  }
}
