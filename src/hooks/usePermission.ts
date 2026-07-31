'use client'

import { useCallback, useMemo } from 'react'
import { useSession } from 'next-auth/react'

interface PermissionCheckOptions {
  resource: string
  action: string
}

export function usePermission() {
  const { data: session } = useSession()

  /**
   * Check if user has permission for resource.action
   * Format: "resource.action" or separate resource and action
   */
  const can = useCallback(
    (permission: string | PermissionCheckOptions): boolean => {
      if (!session?.user) {
        return false
      }

      let resource: string
      let action: string

      if (typeof permission === 'string') {
        const [res, act] = permission.split('.')
        resource = res
        action = act
      } else {
        resource = permission.resource
        action = permission.action
      }

      // Get permissions from session (cached on login)
      const userPermissions = (session.user as any)?.permissions || []

      return userPermissions.some(
        (p: any) =>
          p.resource === resource && p.action === action
      )
    },
    [session]
  )

  /**
   * Check multiple permissions (AND - all must be true)
   */
  const canAll = useCallback(
    (permissions: string[]): boolean => {
      return permissions.every(perm => can(perm))
    },
    [can]
  )

  /**
   * Check multiple permissions (OR - at least one must be true)
   */
  const canAny = useCallback(
    (permissions: string[]): boolean => {
      return permissions.some(perm => can(perm))
    },
    [can]
  )

  /**
   * Get all user permissions
   */
  const permissions = useMemo(
    () => (session?.user as any)?.permissions || [],
    [session]
  )

  return {
    can,
    canAll,
    canAny,
    permissions,
    isLoading: !session,
  }
}
