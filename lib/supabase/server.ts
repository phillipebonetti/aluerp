import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { SUPABASE_URL, SUPABASE_ANON_KEY, hasSupabase } from '@/lib/env'

/**
 * Cria o client Supabase para Server Components e Server Actions.
 *
 * Retorna `null` quando as env vars não estão configuradas, em vez de lançar.
 * Os callers verificam o retorno e usam o fallback de preview quando necessário.
 */
export async function createClient() {
  if (!hasSupabase) return null

  const cookieStore = await cookies()

  return createServerClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {
          // Ignorado em Server Components (sem efeito colateral)
        }
      },
    },
  })
}
