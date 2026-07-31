/**
 * Constantes de Cores e Paleta de Design
 * Define cores para UI, status, categorias, etc.
 */

// Paleta de Cores Principal
export const COLORS = {
  primary: '#3B82F6',      // Azul
  primaryLight: '#DBEAFE',
  primaryDark: '#1E40AF',
  
  success: '#10B981',      // Verde
  successLight: '#D1FAE5',
  successDark: '#047857',
  
  warning: '#F59E0B',      // Âmbar
  warningLight: '#FEF3C7',
  warningDark: '#D97706',
  
  danger: '#EF4444',       // Vermelho
  dangerLight: '#FEE2E2',
  dangerDark: '#DC2626',
  
  info: '#06B6D4',         // Ciano
  infoLight: '#CFFAFE',
  infoDark: '#0891B2',
  
  gray: '#6B7280',         // Cinza
  grayLight: '#F3F4F6',
  grayDark: '#374151',
} as const

// Paleta Tailwind para Status
export const STATUS_COLORS = {
  active: 'bg-green-100 text-green-800 border-green-300',
  inactive: 'bg-gray-100 text-gray-800 border-gray-300',
  suspended: 'bg-red-100 text-red-800 border-red-300',
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  completed: 'bg-green-100 text-green-800 border-green-300',
  cancelled: 'bg-red-100 text-red-800 border-red-300',
  draft: 'bg-slate-100 text-slate-800 border-slate-300',
  sent: 'bg-blue-100 text-blue-800 border-blue-300',
  scheduled: 'bg-purple-100 text-purple-800 border-purple-300',
  inProgress: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  onHold: 'bg-gray-100 text-gray-800 border-gray-300',
  blocked: 'bg-orange-100 text-orange-800 border-orange-300',
} as const

// Cores por Prioridade
export const PRIORITY_COLORS = {
  LOW: 'bg-green-100 text-green-800 border-green-300',
  MEDIUM: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  HIGH: 'bg-orange-100 text-orange-800 border-orange-300',
  CRITICAL: 'bg-red-100 text-red-800 border-red-300',
} as const

// Cores por Categoria de Transação
export const TRANSACTION_CATEGORY_COLORS = {
  INCOME: 'bg-green-100 text-green-800',
  EXPENSE: 'bg-red-100 text-red-800',
  TRANSFER: 'bg-blue-100 text-blue-800',
  ADJUSTMENT: 'bg-purple-100 text-purple-800',
} as const

// Cores para Gráficos
export const CHART_COLORS = [
  '#3B82F6', // Azul
  '#10B981', // Verde
  '#F59E0B', // Âmbar
  '#EF4444', // Vermelho
  '#8B5CF6', // Roxo
  '#06B6D4', // Ciano
  '#EC4899', // Rosa
  '#14B8A6', // Teal
]

// Paleta de Cores Pastel para Gráficos
export const CHART_COLORS_LIGHT = [
  '#DBEAFE', // Azul claro
  '#D1FAE5', // Verde claro
  '#FEF3C7', // Âmbar claro
  '#FEE2E2', // Vermelho claro
  '#EDE9FE', // Roxo claro
  '#CFFAFE', // Ciano claro
  '#FCE7F3', // Rosa claro
  '#CCFBF1', // Teal claro
]

// Cores de Fundo (Background)
export const BACKGROUND_COLORS = {
  primary: '#FFFFFF',
  secondary: '#F9FAFB',
  tertiary: '#F3F4F6',
  light: '#FAFBFC',
} as const

// Cores de Texto
export const TEXT_COLORS = {
  primary: '#111827',
  secondary: '#6B7280',
  tertiary: '#9CA3AF',
  muted: '#D1D5DB',
  light: '#F3F4F6',
} as const

// Cores de Borda
export const BORDER_COLORS = {
  light: '#E5E7EB',
  normal: '#D1D5DB',
  dark: '#9CA3AF',
} as const
