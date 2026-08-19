/**
 * Detecção de ambiente e constantes do AluERP.
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

// ─────────────────────────────────────────────
// Ambiente
// ─────────────────────────────────────────────

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

/** true quando há credenciais Supabase válidas configuradas. */
export const hasSupabase = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY)

/** true quando há uma connection string de banco configurada. */
export const hasDatabase = Boolean(process.env.DATABASE_URL)

/**
 * Preview só existe quando nenhum backend real está configurado.
 * Se apenas uma parte da configuração existir, o app permanece no caminho
 * real e falha explicitamente, nunca troca silenciosamente para preview.
 */
export const isPreviewMode = !hasSupabase && !hasDatabase

/** Nome do cookie de sessão usado no modo preview. */
export const PREVIEW_SESSION_COOKIE = 'aluerp_preview_session'

// ─────────────────────────────────────────────
// Constantes de Domínio
// ─────────────────────────────────────────────

export const STATUS_COLORS: Record<string, string> = {
  'Em andamento': 'bg-warning/15 text-warning-foreground border-warning/30',
  'Aprovada': 'bg-accent/15 text-accent border-accent/30',
  'Concluída': 'bg-success/15 text-success border-success/30',
  'Em orçamento': 'bg-muted text-muted-foreground border-border',
  'Cancelada': 'bg-destructive/15 text-destructive border-destructive/30',
}

export const ROLE_LABELS: Record<string, string> = {
  OWNER: 'Proprietário',
  ADMIN: 'Administrador',
  MANAGER: 'Gerente',
  VIEWER: 'Visualizador',
}

export const PLAN_LABELS: Record<string, string> = {
  FREE: 'Grátis',
  PRO: 'Pro',
  ENTERPRISE: 'Enterprise',
}

export const PROTECTED_ROUTES = [
  '/dashboard',
  '/financeiro',
  '/obras',
  '/clientes',
  '/fornecedores',
  '/orcamentos',
  '/os',
  '/agenda',
  '/relatorios',
  '/configuracoes',
]

export const AUTH_ROUTES = ['/login', '/register']
export const ONBOARDING_ROUTE = '/onboarding'
