// AI Module Types and Interfaces

export interface AIMessage {
  id: string
  conversationId: string
  role: 'user' | 'assistant'
  content: string
  tokens?: number
  model?: string
  responseTime?: number
  keywords?: string[]
  intent?: string
  createdAt: Date
}

export interface AIConversation {
  id: string
  companyId: string
  userId: string
  title: string
  description?: string
  category: 'general' | 'analysis' | 'documents' | 'predictions'
  status: 'ACTIVE' | 'ARCHIVED' | 'DELETED'
  isPinned: boolean
  tokenCount: number
  messageCount: number
  createdAt: Date
  updatedAt: Date
  messages?: AIMessage[]
}

export interface AIContextData {
  works: {
    total: number
    inProgress: number
    completed: number
    delayed: number
  }
  financial: {
    revenue: number
    expenses: number
    profit: number
    cashFlow: number
  }
  clients: {
    total: number
    active: number
    inactive: number
    overdue: number
  }
  suppliers: {
    total: number
    topSpend: string[]
  }
  sales: {
    total: number
    topSeller: string
    conversionRate: number
  }
  receivables: {
    total: number
    overdue: number
    dueToday: number
    upcomingDays7: number
  }
  payables: {
    total: number
    overdue: number
    dueToday: number
    upcomingDays7: number
  }
}

export interface AIProvider {
  name: 'OPENAI' | 'AZURE_OPENAI' | 'ANTHROPIC' | 'GOOGLE_GEMINI' | 'OLLAMA'
  apiKey: string
  apiEndpoint?: string
  modelId: string
  temperature: number
  maxTokens: number
  topP: number
}

export interface AIGenerateOptions {
  prompt: string
  conversationId?: string
  context?: AIContextData
  stream?: boolean
  temperature?: number
  maxTokens?: number
}

export interface AIResponse {
  content: string
  tokens: {
    input: number
    output: number
    total: number
  }
  model: string
  duration: number
  stop_reason?: string
}

export interface AIInsight {
  id: string
  type: 'growth' | 'warning' | 'opportunity' | 'anomaly'
  category: 'sales' | 'financial' | 'operational' | 'customer'
  title: string
  description: string
  recommendation?: string
  severity: 'info' | 'warning' | 'critical'
  metric?: string
  changePercent?: number
  isRead: boolean
  createdAt: Date
}

export interface AIPrediction {
  id: string
  type: 'revenue' | 'cash_flow' | 'expenses' | 'receivables' | 'demand'
  period: 'monthly' | 'quarterly' | 'yearly'
  predictedValue: number
  confidence: number
  rangeMin?: number
  rangeMax?: number
  fromDate: Date
  toDate: Date
  historicalPoints?: Array<{ date: Date; value: number }>
}

export interface AIGeneratedDocument {
  id: string
  docType: 'email' | 'proposal' | 'contract' | 'reminder' | 'report'
  title: string
  content: string
  status: 'draft' | 'reviewed' | 'sent' | 'archived'
  relatedEntity?: string
  relatedId?: string
  reviewedBy?: string
  reviewedAt?: Date
}

export interface AIPredefinedPrompt {
  id: string
  name: string
  description?: string
  category: 'analytics' | 'documents' | 'recommendations' | 'search'
  template: string
  variables?: string[]
  isFavorite: boolean
  usageCount: number
}

export interface AIProviderConfig {
  id: string
  companyId: string
  provider: AIProvider['name']
  apiKey: string
  apiEndpoint?: string
  modelId: string
  temperature: number
  maxTokens: number
  topP: number
  isActive: boolean
  lastTestedAt?: Date
}

export interface AIUsageLog {
  id: string
  companyId: string
  userId?: string
  provider: string
  model?: string
  endpoint?: string
  inputTokens: number
  outputTokens: number
  totalTokens: number
  estimatedCost: number
  status: 'success' | 'error' | 'timeout'
  errorMessage?: string
  duration?: number
  createdAt: Date
}

// ERP Context Queries
export interface ERPContextQuery {
  type: 'stats' | 'search' | 'analytics' | 'recommendations'
  query: string
  filters?: {
    dateRange?: { from: Date; to: Date }
    clientId?: string
    workId?: string
    status?: string[]
  }
}

export interface ERPContextResult {
  data: any
  summary: string
  confidence: number
}

// System Prompt Template
export const SYSTEM_PROMPT = `Você é um assistente AI corporativo (copiloto empresarial) do AluERP, um sistema de gestão de obras e serviços de construção. 

Suas responsabilidades:
- Consultar dados do sistema respeitando permissões do usuário
- Gerar análises inteligentes sobre vendas, financeiro e operações
- Fazer previsões baseadas em dados históricos
- Gerar documentos (emails, propostas, lembretes)
- Oferecer recomendações estratégicas
- Executar automações mediante confirmação do usuário

Diretrizes:
- Sempre cite fontes de dados quando possível
- Nunca invente dados ou estatísticas
- Respeite rigorosamente as permissões do usuário
- Se não tiver acesso a informações, comunique claramente
- Ofereça soluções alternativas quando uma consulta não puder ser atendida
- Mantenha um tom profissional e confiável
- Use formatação markdown quando apropriado
- Para gráficos/dados, prefira tabelas estruturadas

Contexto atual do sistema será fornecido em cada mensagem.`
