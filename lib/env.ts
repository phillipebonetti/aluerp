/**
 * Detecção de ambiente do AluERP.
 *
 * O app opera em dois modos:
 *
 * 1. PRODUCTION — Supabase Auth + Prisma/Postgres.
 *    Ativo quando NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY existem.
 *
 * 2. PREVIEW — sessão em cookie assinado + store em memória.
 *    Ativo quando as env vars do Supabase estão ausentes.
 *    Permite navegar, criar conta e criar empresa sem nenhuma credencial,
 *    mantendo o mesmo contrato de tipos das actions reais.
 *
 * Nenhum componente de UI conhece o modo ativo. A troca é transparente:
 * ao conectar o Supabase, o fluxo real assume sem refatoração.
 */

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

/** true quando há credenciais Supabase válidas configuradas. */
export const hasSupabase = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY)

/** true quando há uma connection string de banco configurada. */
export const hasDatabase = Boolean(process.env.DATABASE_URL)

/** true quando o app deve usar o fallback de preview (sem backend). */
export const isPreviewMode = !hasSupabase

/** Nome do cookie de sessão usado no modo preview. */
export const PREVIEW_SESSION_COOKIE = 'aluerp_preview_session'
