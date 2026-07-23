/**
 * Constantes de domínio do AluERP.
 * Separadas dos dados mock para facilitar reutilização nos módulos.
 */

export const STATUS_COLORS: Record<string, string> = {
  'Em andamento': 'bg-warning/15 text-warning-foreground border-warning/30',
  'Aprovada':     'bg-accent/15 text-accent border-accent/30',
  'Concluída':    'bg-success/15 text-success border-success/30',
  'Em orçamento': 'bg-muted text-muted-foreground border-border',
  'Cancelada':    'bg-destructive/15 text-destructive border-destructive/30',
}

export const ROLE_LABELS: Record<string, string> = {
  OWNER:   'Proprietário',
  ADMIN:   'Administrador',
  MANAGER: 'Gerente',
  VIEWER:  'Visualizador',
}

export const PLAN_LABELS: Record<string, string> = {
  FREE:       'Grátis',
  PRO:        'Pro',
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
