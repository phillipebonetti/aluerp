'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ClientSession } from '@/src/lib/portal/types'
import { getClientSessionAction } from '@/src/actions/portal'

export function useClientSession() {
  const router = useRouter()
  const [session, setSession] = useState<ClientSession | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const checkSession = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const sessionData = await getClientSessionAction()
      
      if (!sessionData) {
        setSession(null)
        router.push('/portal/auth/login')
        return
      }

      // Check if session is expired
      if (new Date(sessionData.expiresAt) < new Date()) {
        setSession(null)
        setError('Sessão expirada')
        router.push('/portal/auth/login')
        return
      }

      setSession(sessionData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao verificar sessão')
      console.error('[v0] Session check error:', err)
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    checkSession()

    // Check session every 5 minutes
    const interval = setInterval(checkSession, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [checkSession])

  return { session, loading, error, refetch: checkSession }
}
