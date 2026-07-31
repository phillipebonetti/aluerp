'use client'

import { ReactNode } from 'react'
import { usePermission } from '@/src/hooks/usePermission'

interface PermissionProps {
  children: ReactNode
  action: string
  require?: 'all' | 'any' // for multiple actions
  actions?: string[] // multiple actions
  fallback?: ReactNode
}

/**
 * Conditionally renders children based on user permissions
 * 
 * Usage:
 * <Permission action="clientes.criar">
 *   <Button>Novo Cliente</Button>
 * </Permission>
 * 
 * <Permission require="any" actions={["clientes.editar", "clientes.deletar"]}>
 *   <Button>Editar ou Deletar</Button>
 * </Permission>
 */
export function Permission({
  children,
  action,
  actions,
  require = 'all',
  fallback,
}: PermissionProps) {
  const { can, canAll, canAny, isLoading } = usePermission()

  // Handle loading state
  if (isLoading) {
    return fallback || null
  }

  // Single permission check
  if (action && !actions) {
    if (!can(action)) {
      return fallback || null
    }
    return <>{children}</>
  }

  // Multiple permissions check
  if (actions && actions.length > 0) {
    const hasPermission = require === 'all' ? canAll(actions) : canAny(actions)
    if (!hasPermission) {
      return fallback || null
    }
    return <>{children}</>
  }

  return <>{children}</>
}

/**
 * Higher-order component to protect components
 */
export function withPermission<P extends object>(
  Component: React.ComponentType<P>,
  action: string,
  fallback?: ReactNode
) {
  return function ProtectedComponent(props: P) {
    return (
      <Permission action={action} fallback={fallback}>
        <Component {...props} />
      </Permission>
    )
  }
}
