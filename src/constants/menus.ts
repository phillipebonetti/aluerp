/**
 * Constantes de Menu e Navegação
 * Define estrutura de menus, rotas e itens de navegação
 */

export const MAIN_MENU_ITEMS = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    href: '/dashboard',
    icon: 'LayoutGrid',
    requiredPermission: 'dashboard:read',
  },
  {
    id: 'clientes',
    label: 'Clientes',
    href: '/clientes',
    icon: 'Users',
    requiredPermission: 'client:read',
  },
  {
    id: 'obras',
    label: 'Obras',
    href: '/obras',
    icon: 'Building2',
    requiredPermission: 'project:read',
  },
  {
    id: 'orcamentos',
    label: 'Orçamentos',
    href: '/orcamentos',
    icon: 'FileText',
    requiredPermission: 'quote:read',
  },
  {
    id: 'os',
    label: 'Ordens de Serviço',
    href: '/os',
    icon: 'Briefcase',
    requiredPermission: 'os:read',
  },
  {
    id: 'financeiro',
    label: 'Financeiro',
    href: '/financeiro',
    icon: 'DollarSign',
    requiredPermission: 'financial:read',
  },
  {
    id: 'fornecedores',
    label: 'Fornecedores',
    href: '/fornecedores',
    icon: 'Truck',
    requiredPermission: 'supplier:read',
  },
  {
    id: 'relatorios',
    label: 'Relatórios',
    href: '/relatorios',
    icon: 'BarChart3',
    requiredPermission: 'report:read',
  },
  {
    id: 'configuracoes',
    label: 'Configurações',
    href: '/configuracoes',
    icon: 'Settings',
    requiredPermission: 'settings:read',
  },
] as const

export const ADMIN_MENU_ITEMS = [
  {
    id: 'admin-panel',
    label: 'Admin',
    href: '/admin',
    icon: 'Shield',
    requiredPermission: 'admin:panel',
  },
  {
    id: 'usuarios',
    label: 'Usuários',
    href: '/admin/usuarios',
    icon: 'Users',
    requiredPermission: 'user:manage',
  },
  {
    id: 'empresa',
    label: 'Empresa',
    href: '/admin/empresa',
    icon: 'Building',
    requiredPermission: 'company:manage',
  },
] as const

export const SETTINGS_MENU_ITEMS = [
  {
    id: 'settings-geral',
    label: 'Geral',
    href: '/configuracoes/geral',
    icon: 'Settings',
  },
  {
    id: 'settings-perfil',
    label: 'Perfil',
    href: '/configuracoes/perfil',
    icon: 'User',
  },
  {
    id: 'settings-notificacoes',
    label: 'Notificações',
    href: '/configuracoes/notificacoes',
    icon: 'Bell',
  },
  {
    id: 'settings-seguranca',
    label: 'Segurança',
    href: '/configuracoes/seguranca',
    icon: 'Lock',
  },
  {
    id: 'settings-integracao',
    label: 'Integração',
    href: '/configuracoes/integracao',
    icon: 'Plug',
  },
] as const

// Rotas Protegidas
export const PROTECTED_ROUTES = [
  '/dashboard',
  '/clientes',
  '/obras',
  '/orcamentos',
  '/os',
  '/financeiro',
  '/fornecedores',
  '/relatorios',
  '/configuracoes',
  '/admin',
] as const

// Rotas Públicas
export const PUBLIC_ROUTES = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
] as const

// Rotas de Autenticação
export const AUTH_ROUTES = ['/login', '/register'] as const

// Rota de Onboarding
export const ONBOARDING_ROUTE = '/onboarding'

// Rota padrão após login
export const DEFAULT_LOGIN_REDIRECT = '/dashboard'

// Rota padrão após logout
export const DEFAULT_LOGOUT_REDIRECT = '/login'

// Dropdown de usuário
export const USER_DROPDOWN_ITEMS = [
  {
    id: 'profile',
    label: 'Meu Perfil',
    href: '/configuracoes/perfil',
    icon: 'User',
  },
  {
    id: 'settings',
    label: 'Configurações',
    href: '/configuracoes',
    icon: 'Settings',
  },
  {
    id: 'help',
    label: 'Ajuda',
    href: '/ajuda',
    icon: 'HelpCircle',
  },
  {
    id: 'logout',
    label: 'Sair',
    href: '/logout',
    icon: 'LogOut',
    isAction: true,
  },
] as const

// Breadcrumb Routes
export const BREADCRUMB_LABELS: Record<string, string> = {
  'dashboard': 'Dashboard',
  'clientes': 'Clientes',
  'obras': 'Obras',
  'orcamentos': 'Orçamentos',
  'os': 'Ordens de Serviço',
  'financeiro': 'Financeiro',
  'fornecedores': 'Fornecedores',
  'relatorios': 'Relatórios',
  'configuracoes': 'Configurações',
  'admin': 'Admin',
  'novo': 'Novo',
  'editar': 'Editar',
  'detalhes': 'Detalhes',
  'relatorio': 'Relatório',
}

// Rota que nunca deve ser acessada
export const NEVER_ACCESSIBLE_ROUTE = '/404'
