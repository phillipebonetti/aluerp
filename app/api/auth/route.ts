import { NextRequest } from 'next/server'
import { z } from 'zod'
import { handleApiRequest, validateBody, ApiError } from '@/src/api/middleware'
import { ApiResponses } from '@/src/api/utils/response'
import { AuthService } from '@/src/services'

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
})

const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  companyName: z.string().min(2, 'Empresa deve ter no mínimo 2 caracteres'),
})

/**
 * POST /api/auth/login
 * Autentica usuário e retorna token
 *
 * TODO: Implementar com Better Auth ou seu serviço de autenticação
 */
export async function POST(request: NextRequest) {
  return handleApiRequest(async (req) => {
    try {
      const { pathname } = new URL(req.url)

      if (pathname.includes('/login')) {
        return handleLogin(req)
      }

      if (pathname.includes('/register')) {
        return handleRegister(req)
      }

      if (pathname.includes('/refresh')) {
        return handleRefreshToken(req)
      }

      return ApiResponses.badRequest('Endpoint não encontrado')
    } catch (error) {
      if (error instanceof ApiError) throw error
      throw new ApiError(500, 'Erro na autenticação')
    }
  }, request)
}

/**
 * Login de usuário
 */
async function handleLogin(request: NextRequest) {
  try {
    const body = await validateBody(request, loginSchema)
    if (!body) {
      return ApiResponses.badRequest('Dados de login inválidos')
    }

    const authService = new AuthService()

    // TODO: Implementar validação de senha com Better Auth
    // const token = await authService.login(body.email, body.password)

    // Placeholder: retornar token mockado
    const mockToken = Buffer.from(
      JSON.stringify({
        sub: 'user-id',
        email: body.email,
        iat: Date.now(),
        exp: Date.now() + 24 * 60 * 60 * 1000, // 24h
      })
    ).toString('base64')

    const user = await authService.getUserByEmail(body.email)
    if (!user) {
      return ApiResponses.unauthorized('Email ou senha incorretos')
    }

    return ApiResponses.success(
      {
        token: mockToken,
        user,
        expiresIn: 86400, // 24h em segundos
      },
      'Login realizado com sucesso'
    )
  } catch (error) {
    if (error instanceof Response) return error
    throw new ApiError(400, 'Erro ao fazer login')
  }
}

/**
 * Registro de novo usuário
 */
async function handleRegister(request: NextRequest) {
  try {
    const body = await validateBody(request, registerSchema)
    if (!body) {
      return ApiResponses.badRequest('Dados de registro inválidos')
    }

    const authService = new AuthService()

    // TODO: Implementar criação de usuário com Better Auth
    // const newUser = await authService.register(body)

    // Placeholder: retornar usuário mockado
    const mockToken = Buffer.from(
      JSON.stringify({
        sub: 'new-user-id',
        email: body.email,
        iat: Date.now(),
        exp: Date.now() + 24 * 60 * 60 * 1000,
      })
    ).toString('base64')

    return ApiResponses.created(
      {
        token: mockToken,
        user: {
          id: 'new-user-id',
          email: body.email,
          name: body.name,
          companyId: 'new-company-id',
        },
        expiresIn: 86400,
      },
      'Usuário registrado com sucesso'
    )
  } catch (error) {
    if (error instanceof Response) return error
    throw new ApiError(400, 'Erro ao registrar usuário')
  }
}

/**
 * Atualização de token
 */
async function handleRefreshToken(request: NextRequest) {
  try {
    const body = await request.json()
    const refreshToken = body.refreshToken

    if (!refreshToken) {
      return ApiResponses.badRequest('Refresh token não fornecido')
    }

    // TODO: Implementar validação e atualização de token
    // const newToken = await authService.refreshToken(refreshToken)

    // Placeholder: retornar novo token mockado
    const newToken = Buffer.from(
      JSON.stringify({
        sub: 'user-id',
        iat: Date.now(),
        exp: Date.now() + 24 * 60 * 60 * 1000,
      })
    ).toString('base64')

    return ApiResponses.success(
      {
        token: newToken,
        expiresIn: 86400,
      },
      'Token atualizado com sucesso'
    )
  } catch (error) {
    throw new ApiError(401, 'Token inválido ou expirado')
  }
}
