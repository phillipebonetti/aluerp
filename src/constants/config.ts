/**
 * Constantes de Configuração Global
 * Limites, timeouts, padrões de aplicação, etc.
 */

// Ambiente
export const ENVIRONMENT = process.env.NODE_ENV || 'development'
export const IS_PRODUCTION = ENVIRONMENT === 'production'
export const IS_DEVELOPMENT = ENVIRONMENT === 'development'
export const IS_PREVIEW = !process.env.NEXT_PUBLIC_SUPABASE_URL

// URLs
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'

// Limites de Dados
export const LIMITS = {
  // Paginação
  ITEMS_PER_PAGE: 10,
  ITEMS_PER_PAGE_LARGE: 25,
  ITEMS_PER_PAGE_SMALL: 5,

  // Uploads
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_DOCUMENT_SIZE: 20 * 1024 * 1024, // 20MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'application/msword'],

  // Texto
  MAX_NAME_LENGTH: 255,
  MAX_EMAIL_LENGTH: 254,
  MAX_PHONE_LENGTH: 20,
  MAX_TEXTAREA_LENGTH: 5000,
  MAX_DESCRIPTION_LENGTH: 1000,

  // Valores
  MIN_PROJECT_BUDGET: 100,
  MAX_PROJECT_BUDGET: 999999999,
  MIN_QUOTE_TOTAL: 100,
  MAX_QUOTE_TOTAL: 999999999,

  // Datas
  MIN_DATE_RANGE_DAYS: 1,
  MAX_DATE_RANGE_DAYS: 365,

  // Usuários
  MIN_PASSWORD_LENGTH: 8,
  MAX_PASSWORD_LENGTH: 128,
  MAX_USERS_PER_COMPANY: 100,
} as const

// Timeouts e Delays
export const TIMEOUTS = {
  DEBOUNCE_SEARCH: 300,
  DEBOUNCE_INPUT: 500,
  THROTTLE_SCROLL: 1000,
  API_TIMEOUT: 30000, // 30 segundos
  SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutos
  CACHE_TIMEOUT: 5 * 60 * 1000, // 5 minutos
  TOAST_DURATION: 3000, // 3 segundos
  MODAL_ANIMATION: 300, // 300ms
} as const

// Paginação Padrão
export const DEFAULT_PAGINATION = {
  page: 1,
  pageSize: LIMITS.ITEMS_PER_PAGE,
  sortBy: 'createdAt',
  sortOrder: 'desc',
} as const

// Formato de Data
export const DATE_FORMATS = {
  SHORT: 'DD/MM/YYYY',
  LONG: 'DD/MM/YYYY HH:mm',
  ISO: 'YYYY-MM-DD',
  US: 'MM/DD/YYYY',
  FULL: 'dddd, DD [de] MMMM [de] YYYY',
  MONTH_YEAR: 'MM/YYYY',
} as const

// Formato de Moeda
export const CURRENCY_FORMAT = {
  locale: 'pt-BR',
  currency: 'BRL',
  symbol: 'R$',
  decimalSeparator: ',',
  thousandsSeparator: '.',
} as const

// Formato de Número
export const NUMBER_FORMAT = {
  locale: 'pt-BR',
  decimalSeparator: ',',
  thousandsSeparator: '.',
  decimals: 2,
} as const

// Validação
export const VALIDATION = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_REGEX: /^\(\d{2}\)\s?\d{4,5}-\d{4}$/,
  CPF_REGEX: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
  CNPJ_REGEX: /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/,
  CEP_REGEX: /^\d{5}-\d{3}$/,
  URL_REGEX: /^https?:\/\/.+/,
  STRONG_PASSWORD_REGEX: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
} as const

// Planos de Inscrição
export const SUBSCRIPTION_PLANS = {
  FREE: 'FREE',
  PRO: 'PRO',
  ENTERPRISE: 'ENTERPRISE',
} as const

export const PLAN_FEATURES = {
  FREE: {
    name: 'Grátis',
    price: 0,
    maxUsers: 1,
    maxProjects: 5,
    maxClients: 20,
    features: [
      'Dashboard básico',
      'Gestão de clientes',
      'Gestão de obras',
      'Suporte por email',
    ],
  },
  PRO: {
    name: 'Pro',
    price: 99,
    maxUsers: 5,
    maxProjects: 50,
    maxClients: 200,
    features: [
      'Tudo do plano Grátis',
      'Dashboard avançado',
      'Relatórios personalizados',
      'Integração com APIs',
      'Suporte prioritário',
    ],
  },
  ENTERPRISE: {
    name: 'Enterprise',
    price: 299,
    maxUsers: -1, // Ilimitado
    maxProjects: -1,
    maxClients: -1,
    features: [
      'Tudo do plano Pro',
      'Customizações personalizadas',
      'Integração com sistemas legados',
      'Suporte dedicado 24/7',
      'SLA garantido',
    ],
  },
} as const

// Email
export const EMAIL_CONFIG = {
  FROM: 'noreply@aluerp.com.br',
  SUPPORT: 'suporte@aluerp.com.br',
  SALES: 'vendas@aluerp.com.br',
} as const

// Logs e Auditoria
export const AUDIT_CONFIG = {
  ENABLE_AUDIT_LOG: true,
  LOG_SENSITIVE_DATA: false,
  RETENTION_DAYS: 365,
} as const

// Cache
export const CACHE_CONFIG = {
  ENABLE_CLIENT_CACHE: true,
  ENABLE_SERVER_CACHE: true,
  DEFAULT_TTL: 5 * 60, // 5 minutos
  LONG_TTL: 60 * 60, // 1 hora
  SHORT_TTL: 60, // 1 minuto
} as const

// Features Flags
export const FEATURE_FLAGS = {
  ENABLE_QUOTES: true,
  ENABLE_SERVICE_ORDERS: true,
  ENABLE_FINANCIAL_REPORTS: true,
  ENABLE_CRM_MODULE: false,
  ENABLE_INVENTORY: false,
  ENABLE_EMPLOYEE_MANAGEMENT: false,
  ENABLE_THIRD_PARTY_INTEGRATIONS: false,
} as const

// Cores Padronizadas por Entidade
export const ENTITY_COLORS = {
  CLIENT: '#3B82F6',
  PROJECT: '#10B981',
  QUOTE: '#F59E0B',
  SERVICE_ORDER: '#8B5CF6',
  TRANSACTION_INCOME: '#10B981',
  TRANSACTION_EXPENSE: '#EF4444',
  SUPPLIER: '#06B6D4',
  EMPLOYEE: '#EC4899',
} as const
