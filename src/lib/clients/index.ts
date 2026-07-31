/**
 * Clientes Centralizados do AluERP
 * 
 * Single instances de clientes de banco de dados e APIs
 * Evita múltiplas instâncias e facilita gerenciamento
 */

import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'

// Cache global para clientes (singleton pattern)
const globalClients = globalThis as any

/**
 * Supabase Browser Client
 * Usado em componentes React client-side
 */
export function getSupabaseBrowserClient(): SupabaseClient {
  if (globalClients.supabaseBrowserClient) {
    return globalClients.supabaseBrowserClient
  }

  const client = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  if (process.env.NODE_ENV !== 'production') {
    globalClients.supabaseBrowserClient = client
  }

  return client
}

/**
 * Prisma Client
 * Usado em server actions e API routes
 */
export async function getPrismaClient() {
  try {
    const { PrismaClient } = await import('@prisma/client')

    if (globalClients.prismaClient) {
      return globalClients.prismaClient
    }

    const client = new PrismaClient()

    if (process.env.NODE_ENV !== 'production') {
      globalClients.prismaClient = client
    }

    return client
  } catch (error) {
    console.error('[lib/clients] Prisma client init failed:', error)
    return null
  }
}

/**
 * Re-exports de compatibilidade
 */
export { getSupabaseBrowserClient as getSupabaseClient }
export { getPrismaClient as getPrisma }
