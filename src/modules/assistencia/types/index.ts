/**
 * Assistência Técnica Module Types
 * Tipos e interfaces para o módulo de Assistência Técnica
 */

export interface AssistenciaTicket {
  id: string
  companyId: string
  numero: string
  clienteId: string
  titulo: string
  descricao: string
  status: 'aberto' | 'em_andamento' | 'aguardando_cliente' | 'resolvido' | 'fechado'
  prioridade: 'baixa' | 'média' | 'alta' | 'crítica'
  dataCriacao: Date
  dataResolucao?: Date
  assignado?: string
  estimativaHoras?: number
}

export interface AssistenciaChamado {
  id: string
  companyId: string
  ticketId: string
  tecnico: string
  dataAgendada: Date
  dataPrevista: Date
  local: string
  descricao: string
  status: 'agendado' | 'em_progresso' | 'concluído' | 'cancelado'
  resultado?: string
}

export interface AssistenciaContrato {
  id: string
  companyId: string
  clienteId: string
  numero: string
  descricao: string
  dataInicio: Date
  dataFim: Date
  valor: number
  sla?: string
  ativo: boolean
}

export interface AssistenciaConhecimento {
  id: string
  companyId: string
  titulo: string
  categoria: string
  conteudo: string
  palavrasChave: string[]
  autor: string
  createdAt: Date
  updatedAt: Date
}
