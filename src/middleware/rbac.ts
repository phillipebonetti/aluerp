import { NextRequest, NextResponse } from 'next/server'
import type { Role } from '@/src/lib/rbac'
import { PROTECTED_ROUTES } from '@/src/lib/rbac'

export interface UserSession {
  userId: string
  email: string
  role: Role
  companyId: string
}

export async function checkRBACPermission(
  request: NextRequest,
  requiredRoles: Role[]
): Promise<{ allowed: boolean; user?: UserSession }> {
  try {
    // Get user from session/cookie
    const sessionCookie = request.cookies.get('session')
    if (!sessionCookie) {
      return { allowed: false }
    }

    // Parse session (simplified - would normally decode JWT or fetch from store)
    const user = JSON.parse(sessionCookie.value) as UserSession
    
    // Check if user role is in allowed roles
    const hasAccess = requiredRoles.includes(user.role)
    return { allowed: hasAccess, user }
  } catch (error) {
    console.error('[v0] RBAC check failed:', error)
    return { allowed: false }
  }
}

export function getRequiredRolesForPath(pathname: string): Role[] | null {
  // Check each protected route
  for (const [route, roles] of Object.entries(PROTECTED_ROUTES)) {
    if (pathname.startsWith(route)) {
      return roles
    }
  }
  return null
}
