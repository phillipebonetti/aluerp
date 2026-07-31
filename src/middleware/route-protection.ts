import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

/**
 * Route protection configuration
 * Defines which routes require which permissions
 */
export const protectedRoutes = {
  dashboard: { permission: 'dashboard.view', requiredAuth: true },
  
  clientes: { permission: 'clientes.read', requiredAuth: true },
  'clientes/novo': { permission: 'clientes.create', requiredAuth: true },
  'clientes/[id]': { permission: 'clientes.read', requiredAuth: true },
  'clientes/[id]/editar': { permission: 'clientes.update', requiredAuth: true },
  
  obras: { permission: 'obras.view', requiredAuth: true },
  'obras/novo': { permission: 'obras.create', requiredAuth: true },
  'obras/[id]': { permission: 'obras.view', requiredAuth: true },
  'obras/[id]/editar': { permission: 'obras.edit', requiredAuth: true },
  
  financeiro: { permission: 'financeiro.view', requiredAuth: true },
  'financeiro/transacoes': { permission: 'financeiro.view', requiredAuth: true },
  'financeiro/relatorios': { permission: 'relatorios.view', requiredAuth: true },
  
  fornecedores: { permission: 'fornecedores.read', requiredAuth: true },
  'fornecedores/novo': { permission: 'fornecedores.create', requiredAuth: true },
  'fornecedores/[id]': { permission: 'fornecedores.read', requiredAuth: true },
  
  relatorios: { permission: 'relatorios.view', requiredAuth: true },
  'relatorios/exportar': { permission: 'relatorios.export', requiredAuth: true },
  
  orcamentos: { permission: 'obras.view', requiredAuth: true },
  
  configuracoes: { permission: 'configuracoes.edit', requiredAuth: true },
  'configuracoes/permissoes': { permission: 'configuracoes.edit', requiredAuth: true },
  'configuracoes/usuarios': { permission: 'configuracoes.edit', requiredAuth: true },
  'configuracoes/auditoria': { permission: 'configuracoes.view', requiredAuth: true },
}

/**
 * Check if a route is protected
 */
export function isProtectedRoute(pathname: string): boolean {
  const routes = Object.keys(protectedRoutes)
  return routes.some(route => pathname.includes(`/${route}`))
}

/**
 * Get required permission for a route
 */
export function getRequiredPermission(
  pathname: string
): string | null {
  const routes = Object.keys(protectedRoutes)
  
  for (const route of routes) {
    if (pathname.includes(`/${route}`)) {
      return (protectedRoutes as any)[route].permission
    }
  }
  
  return null
}

/**
 * Middleware to protect routes
 * Usage in middleware.ts
 */
export async function checkRoutePermission(
  request: NextRequest,
  token: any
): Promise<NextResponse | null> {
  const pathname = request.nextUrl.pathname

  // Check if route is protected
  if (!isProtectedRoute(pathname)) {
    return null // Continue normally
  }

  // Redirect to login if not authenticated
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Get required permission
  const requiredPermission = getRequiredPermission(pathname)

  // If permission is required, check if user has it
  if (requiredPermission) {
    const userPermissions = token.permissions || []

    const hasPermission = userPermissions.some(
      (p: any) =>
        `${p.resource}.${p.action}` === requiredPermission
    )

    if (!hasPermission) {
      // Redirect to 403 Forbidden page
      return NextResponse.redirect(new URL('/403', request.url))
    }
  }

  return null // Permission granted, continue normally
}
