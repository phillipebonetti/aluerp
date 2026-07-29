/**
 * Produção Module Types
 * Tipos e interfaces para o módulo de Gestão de Produção
 */

export interface ProducaoOrdem {
  id: string
  companyId: string
  numero: string
  projectId: string
  dataInicio: Date
  dataFim?: Date
  status: 'planejada' | 'em_progresso' | 'pausada' | 'concluída'
  prioridade: 'baixa' | 'média' | 'alta' | 'crítica'
  totalHoras: number
  horasExecutadas: number
  createdAt: Date
  updatedAt: Date
}

export interface ProducaoOperacao {
  id: string
  companyId: string
  ordemId: string
  numero: number
  descricao: string
  tempo: number // minutos
  recursoId: string
  status: 'pendente' | 'executando' | 'concluída' | 'com_defeito'
  createdAt: Date
}

export interface ProducaoRecurso {
  id: string
  companyId: string
  nome: string
  tipo: 'máquina' | 'pessoa' | 'equipamento'
  capacidade: number
  status: 'disponível' | 'em_uso' | 'manutenção'
  ultimaManutencao?: Date
}

export interface ProducaoQualidade {
  id: string
  companyId: string
  ordemId: string
  dataVerificacao: Date
  inspecionador: string
  resultado: 'aprovado' | 'reprovado' | 'condicional'
  observacoes?: string
}
