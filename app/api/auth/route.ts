import { NextRequest } from 'next/server'
import { z } from 'zod'
import { handleApiRequest, validateBody, ApiError } from '@/src/api/middleware'
import { ApiResponses } from '@/src/api/utils/response'
import { createServerClient } from '@/src/core/supabase'
import { getPrisma } from '@/src/core/database'
import { isPreviewMode } from '@/src/core/config'

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

    if (isPreviewMode) {
      return ApiResponses.unauthorized('Login de preview deve usar o fluxo de preview')
    }

    const supabase = await createServerClient()
    if (!supabase) return ApiResponses.internalServerError('Serviço de autenticação indisponível')

    const { data, error } = await supabase.auth.signInWithPassword({
      email: body.email,
      password: body.password,
    })
    if (error || !data.user) {
      return ApiResponses.unauthorized('Email ou senha incorretos')
    }

    const prisma = await getPrisma()
    const profile = await prisma.user.findUnique({ where: { id: data.user.id } })
    if (!profile) return ApiResponses.unauthorized('Perfil de usuário não encontrado')

    return ApiResponses.success({
      user: {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        avatar: profile.image,
      },
    }, 'Login realizado com sucesso')
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

    if (isPreviewMode) {
      return ApiResponses.badRequest('Cadastro de preview deve usar o fluxo de preview')
    }

    const supabase = await createServerClient()
    if (!supabase) return ApiResponses.internalServerError('Serviço de autenticação indisponível')

    const { data, error } = await supabase.auth.signUp({
      email: body.email,
      password: body.password,
    })
    if (error || !data.user) {
      return ApiResponses.badRequest(error?.message || 'Não foi possível criar a conta')
    }

    const prisma = await getPrisma()
    const user = await prisma.user.upsert({
      where: { id: data.user.id },
      create: { id: data.user.id, email: body.email, name: body.name },
      update: { email: body.email, name: body.name },
    })
    const company = await prisma.company.create({
      data: {
        name: body.companyName,
        members: { create: { userId: user.id, role: 'OWNER' } },
      },
    })

    return ApiResponses.created({
      user: { id: user.id, email: user.email, name: user.name },
      company: { id: company.id, name: company.name },
    }, 'Usuário registrado com sucesso')
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

    if (isPreviewMode) {
      return ApiResponses.unauthorized('Refresh não está disponível no modo preview')
    }

    const supabase = await createServerClient()
    if (!supabase) return ApiResponses.internalServerError('Serviço de autenticação indisponível')

    const { data, error } = await supabase.auth.refreshSession({ refresh_token: refreshToken })
    if (error || !data.session) return ApiResponses.unauthorized('Token inválido ou expirado')

    return ApiResponses.success({
      accessToken: data.session.access_token,
      expiresAt: data.session.expires_at,
    }, 'Token atualizado com sucesso')
  } catch {
    throw new ApiError(401, 'Token inválido ou expirado')
  }
}
