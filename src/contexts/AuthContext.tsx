'use client'

import React, { createContext, useContext, useCallback, useEffect, useState } from 'react'

export interface AuthUser {
  id: string
  email: string
  name?: string
  avatar?: string
  companyId: string
  role: string
  permissions: string[]
}

export interface AuthContextType {
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refreshSession: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Verificar sessão ao montar o componente
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        // Tentar recuperar sessão existente
        const response = await fetch('/api/auth/session')
        if (response.ok) {
          const data = await response.json()
          setUser(data.user || null)
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Erro ao inicializar autenticação'
        setError(message)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Falha ao fazer login')
      }

      const data = await response.json()
      setUser(data.user)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao fazer login'
      setError(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      await fetch('/api/auth/logout', {
        method: 'POST',
      })

      setUser(null)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao fazer logout'
      setError(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const refreshSession = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Falha ao atualizar sessão')
      }

      const data = await response.json()
      setUser(data.user)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao atualizar sessão'
      setError(message)
      // Em caso de erro ao atualizar sessão, desautenticar
      setUser(null)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
    login,
    logout,
    refreshSession,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

/**
 * Hook para usar o AuthContext
 * @throws {Error} Se usado fora do AuthProvider
 */
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider')
  }
  return context
}

/**
 * Hook para verificar se usuário tem permissão
 */
export function usePermission(permissionCode: string) {
  const { user } = useAuth()
  return user?.permissions.includes(permissionCode) || false
}

/**
 * Hook para verificar se usuário tem papel específico
 */
export function useRole(roleCode: string) {
  const { user } = useAuth()
  return user?.role === roleCode
}
