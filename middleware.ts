import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { PROTECTED_ROUTES, AUTH_ROUTES } from '@/lib/constants'
import {
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  hasSupabase,
  PREVIEW_SESSION_COOKIE,
} from '@/src/core/config'

function isProtectedPath(pathname: string) {
  return PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  )
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ─────────────────────────────────────────────
  // MODO PREVIEW — sem env vars do Supabase.
  // A sessão é apenas a presença do cookie de preview.
  // ─────────────────────────────────────────────
  if (!hasSupabase) {
    const hasPreviewSession = Boolean(
      request.cookies.get(PREVIEW_SESSION_COOKIE)?.value
    )

    if (isProtectedPath(pathname) && !hasPreviewSession) {
      const loginUrl = request.nextUrl.clone()
      loginUrl.pathname = '/login'
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }

    if (AUTH_ROUTES.includes(pathname) && hasPreviewSession) {
      const dashboardUrl = request.nextUrl.clone()
      dashboardUrl.pathname = '/dashboard'
      dashboardUrl.search = ''
      return NextResponse.redirect(dashboardUrl)
    }

    return NextResponse.next({ request })
  }

  // ─────────────────────────────────────────────
  // MODO PRODUCTION — Supabase Auth com refresh de sessão.
  // ─────────────────────────────────────────────
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        )
        supabaseResponse = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        )
      },
    },
  })

  // IMPORTANTE: não chamar código entre createServerClient e getUser
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (isProtectedPath(pathname) && !user) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/login'
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (AUTH_ROUTES.includes(pathname) && user) {
    const dashboardUrl = request.nextUrl.clone()
    dashboardUrl.pathname = '/dashboard'
    dashboardUrl.search = ''
    return NextResponse.redirect(dashboardUrl)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Aplica middleware em todas as rotas exceto:
     * - _next/static (arquivos estáticos)
     * - _next/image (otimização de imagem)
     * - favicon.ico e outros assets de raiz
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
