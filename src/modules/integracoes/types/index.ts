/**
 * Integrações Module Types
 * Tipos e interfaces para o módulo de Integrações
 */

export interface IntegracaoConexao {
  id: string
  companyId: string
  nome: string
  tipo: 'api' | 'webhook' | 'oauth' | 'cron'
  sistema: string
  status: 'conectado' | 'desconectado' | 'erro'
  credenciais?: Record<string, string>
  dataCriacao: Date
  ultimoSync?: Date
}

export interface IntegracaoMapeamento {
  id: string
  conexaoId: string
  origem: string // Campo de origem
  destino: string // Campo de destino
  tipo: 'direto' | 'transformacao'
  transformacao?: string // Função de transformação
}

export interface IntegracaoEvento {
  id: string
  companyId: string
  conexaoId: string
  tipo: string
  dados: Record<string, unknown>
  status: 'pendente' | 'sucesso' | 'erro'
  tentativas: number
  mensagemErro?: string
  dataCriacao: Date
}

export interface IntegracaoLog {
  id: string
  companyId: string
  conexaoId: string
  acao: string
  dados?: Record<string, unknown>
  resultado: 'sucesso' | 'erro' | 'aviso'
  mensagem?: string
  createdAt: Date
}

export interface IntegracaoWebhook {
  id: string
  companyId: string
  url: string
  eventos: string[]
  status: 'ativo' | 'inativo'
  secret?: string
  tentativasMax: number
  createdAt: Date
}
