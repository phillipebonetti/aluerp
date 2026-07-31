/**
 * Constantes de Pagamento, Categorias e Classificações
 * Define tipos de pagamento, categorias de despesa, etc.
 */

// Tipos de Pagamento
export const PAYMENT_METHODS = {
  CASH: 'CASH',
  CHECK: 'CHECK',
  CREDIT_CARD: 'CREDIT_CARD',
  DEBIT_CARD: 'DEBIT_CARD',
  BANK_TRANSFER: 'BANK_TRANSFER',
  PIXINSTANT: 'PIXINSTANT',
  FINANCING: 'FINANCING',
  OTHER: 'OTHER',
} as const

export const PAYMENT_METHOD_LABELS = {
  CASH: 'Dinheiro',
  CHECK: 'Cheque',
  CREDIT_CARD: 'Cartão de Crédito',
  DEBIT_CARD: 'Cartão de Débito',
  BANK_TRANSFER: 'Transferência Bancária',
  PIXINSTANT: 'PIX',
  FINANCING: 'Financiamento',
  OTHER: 'Outro',
} as const

export const PAYMENT_METHOD_ICONS = {
  CASH: 'DollarSign',
  CHECK: 'FileText',
  CREDIT_CARD: 'CreditCard',
  DEBIT_CARD: 'CreditCard',
  BANK_TRANSFER: 'Send',
  PIXINSTANT: 'Zap',
  FINANCING: 'TrendingUp',
  OTHER: 'MoreHorizontal',
} as const

// Categorias de Transação
export const TRANSACTION_CATEGORIES = {
  // Income
  SERVICE: 'SERVICE',
  PRODUCT_SALE: 'PRODUCT_SALE',
  CONSULTATION: 'CONSULTATION',
  INTEREST: 'INTEREST',
  OTHER_INCOME: 'OTHER_INCOME',

  // Expense
  MATERIALS: 'MATERIALS',
  LABOR: 'LABOR',
  EQUIPMENT: 'EQUIPMENT',
  UTILITIES: 'UTILITIES',
  TRANSPORTATION: 'TRANSPORTATION',
  OFFICE_SUPPLIES: 'OFFICE_SUPPLIES',
  RENT: 'RENT',
  INSURANCE: 'INSURANCE',
  MAINTENANCE: 'MAINTENANCE',
  ADVERTISING: 'ADVERTISING',
  PROFESSIONAL_SERVICES: 'PROFESSIONAL_SERVICES',
  OTHER_EXPENSE: 'OTHER_EXPENSE',
} as const

export const TRANSACTION_CATEGORY_LABELS = {
  // Income
  SERVICE: 'Serviços',
  PRODUCT_SALE: 'Venda de Produtos',
  CONSULTATION: 'Consultoria',
  INTEREST: 'Juros',
  OTHER_INCOME: 'Outra Receita',

  // Expense
  MATERIALS: 'Materiais',
  LABOR: 'Mão de Obra',
  EQUIPMENT: 'Equipamentos',
  UTILITIES: 'Utilidades',
  TRANSPORTATION: 'Transporte',
  OFFICE_SUPPLIES: 'Material de Escritório',
  RENT: 'Aluguel',
  INSURANCE: 'Seguro',
  MAINTENANCE: 'Manutenção',
  ADVERTISING: 'Publicidade',
  PROFESSIONAL_SERVICES: 'Serviços Profissionais',
  OTHER_EXPENSE: 'Outra Despesa',
} as const

// Termos de Pagamento
export const PAYMENT_TERMS = {
  IMMEDIATE: 'IMMEDIATE',
  NET_7: 'NET_7',
  NET_15: 'NET_15',
  NET_30: 'NET_30',
  NET_60: 'NET_60',
  NET_90: 'NET_90',
  CUSTOM: 'CUSTOM',
} as const

export const PAYMENT_TERM_LABELS = {
  IMMEDIATE: 'À Vista',
  NET_7: '7 Dias',
  NET_15: '15 Dias',
  NET_30: '30 Dias',
  NET_60: '60 Dias',
  NET_90: '90 Dias',
  CUSTOM: 'Customizado',
} as const

// Tipos de Cliente
export const CLIENT_TYPES = {
  PESSOA_FISICA: 'PESSOA_FISICA',
  PESSOA_JURIDICA: 'PESSOA_JURIDICA',
} as const

export const CLIENT_TYPE_LABELS = {
  PESSOA_FISICA: 'Pessoa Física',
  PESSOA_JURIDICA: 'Pessoa Jurídica',
} as const

// Tipos de Fornecedor
export const SUPPLIER_TYPES = {
  MATERIAL: 'MATERIAL',
  SERVICE: 'SERVICE',
  EQUIPMENT: 'EQUIPMENT',
  LABOR: 'LABOR',
  GENERAL: 'GENERAL',
} as const

export const SUPPLIER_TYPE_LABELS = {
  MATERIAL: 'Material',
  SERVICE: 'Serviço',
  EQUIPMENT: 'Equipamento',
  LABOR: 'Mão de Obra',
  GENERAL: 'Geral',
} as const

// Categorias de Fornecedor
export const SUPPLIER_CATEGORIES = {
  CONSTRUCTION: 'CONSTRUCTION',
  ELECTRICAL: 'ELECTRICAL',
  PLUMBING: 'PLUMBING',
  HVAC: 'HVAC',
  FINISHING: 'FINISHING',
  LANDSCAPING: 'LANDSCAPING',
  CONSULTING: 'CONSULTING',
  RENTAL: 'RENTAL',
  TRANSPORTATION: 'TRANSPORTATION',
  OTHER: 'OTHER',
} as const

export const SUPPLIER_CATEGORY_LABELS = {
  CONSTRUCTION: 'Construção',
  ELECTRICAL: 'Elétrica',
  PLUMBING: 'Hidráulica',
  HVAC: 'HVAC',
  FINISHING: 'Acabamento',
  LANDSCAPING: 'Paisagismo',
  CONSULTING: 'Consultoria',
  RENTAL: 'Aluguel',
  TRANSPORTATION: 'Transporte',
  OTHER: 'Outro',
} as const

// Tipos de Documento
export const DOCUMENT_TYPES = {
  CPF: 'CPF',
  CNPJ: 'CNPJ',
  RG: 'RG',
  PASSPORT: 'PASSPORT',
  INVOICE: 'INVOICE',
  RECEIPT: 'RECEIPT',
  QUOTE: 'QUOTE',
  CONTRACT: 'CONTRACT',
  OTHER: 'OTHER',
} as const

export const DOCUMENT_TYPE_LABELS = {
  CPF: 'CPF',
  CNPJ: 'CNPJ',
  RG: 'RG',
  PASSPORT: 'Passaporte',
  INVOICE: 'Nota Fiscal',
  RECEIPT: 'Recibo',
  QUOTE: 'Orçamento',
  CONTRACT: 'Contrato',
  OTHER: 'Outro',
} as const

// Estados do Brasil
export const BRAZIL_STATES = {
  AC: 'AC',
  AL: 'AL',
  AP: 'AP',
  AM: 'AM',
  BA: 'BA',
  CE: 'CE',
  DF: 'DF',
  ES: 'ES',
  GO: 'GO',
  MA: 'MA',
  MT: 'MT',
  MS: 'MS',
  MG: 'MG',
  PA: 'PA',
  PB: 'PB',
  PR: 'PR',
  PE: 'PE',
  PI: 'PI',
  RJ: 'RJ',
  RN: 'RN',
  RS: 'RS',
  RO: 'RO',
  RR: 'RR',
  SC: 'SC',
  SP: 'SP',
  SE: 'SE',
  TO: 'TO',
} as const

export const BRAZIL_STATE_NAMES = {
  AC: 'Acre',
  AL: 'Alagoas',
  AP: 'Amapá',
  AM: 'Amazonas',
  BA: 'Bahia',
  CE: 'Ceará',
  DF: 'Distrito Federal',
  ES: 'Espírito Santo',
  GO: 'Goiás',
  MA: 'Maranhão',
  MT: 'Mato Grosso',
  MS: 'Mato Grosso do Sul',
  MG: 'Minas Gerais',
  PA: 'Pará',
  PB: 'Paraíba',
  PR: 'Paraná',
  PE: 'Pernambuco',
  PI: 'Piauí',
  RJ: 'Rio de Janeiro',
  RN: 'Rio Grande do Norte',
  RS: 'Rio Grande do Sul',
  RO: 'Rondônia',
  RR: 'Roraima',
  SC: 'Santa Catarina',
  SP: 'São Paulo',
  SE: 'Sergipe',
  TO: 'Tocantins',
} as const

// Prioridades
export const PRIORITIES = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL',
} as const

export const PRIORITY_LABELS = {
  LOW: 'Baixa',
  MEDIUM: 'Média',
  HIGH: 'Alta',
  CRITICAL: 'Crítica',
} as const
