/**
 * Pós-venda Module Types
 * Tipos e interfaces para o módulo de Gestão Pós-venda
 */

export interface PoSVendaFeedback {
  id: string
  companyId: string
  clienteId: string
  pedidoId: string
  nota: number // 1-5
  comentario?: string
  aspectos: Record<string, number>
  dataFeedback: Date
}

export interface PoSVendaPesquisa {
  id: string
  companyId: string
  numero: string
  titulo: string
  descricao: string
  questoes: PoSVendaQuestao[]
  ativo: boolean
  createdAt: Date
}

export interface PoSVendaQuestao {
  id: string
  pesquisaId: string
  pergunta: string
  tipo: 'múltipla_escolha' | 'escala' | 'aberta'
  obrigatoria: boolean
}

export interface PoSVendaLealdade {
  id: string
  companyId: string
  clienteId: string
  pontos: number
  nivel: 'bronze' | 'prata' | 'ouro' | 'platina'
  dataCadastro: Date
}

export interface PoSVendaReclamacao {
  id: string
  companyId: string
  clienteId: string
  numero: string
  descricao: string
  status: 'aberta' | 'em_andamento' | 'resolvida' | 'fechada'
  dataCriacao: Date
  dataResolucao?: Date
}
