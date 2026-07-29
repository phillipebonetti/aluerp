/**
 * Pós-venda Repository
 * Camada de acesso a dados para o módulo Pós-venda
 */

import { BaseRepository } from '@/repositories'
import type { PoSVendaFeedback, PoSVendaPesquisa, PoSVendaLealdade, PoSVendaReclamacao } from '../types'

export class PoSVendaRepository extends BaseRepository {
  /**
   * Feedback
   */
  async getFeedbacks(companyId: string, limit?: number, offset?: number) {
    // TODO: Implementar
    throw new Error('Not implemented')
  }

  /**
   * Pesquisas
   */
  async getPesquisas(companyId: string) {
    // TODO: Implementar
    throw new Error('Not implemented')
  }

  async getPesquisaById(id: string) {
    // TODO: Implementar
    throw new Error('Not implemented')
  }

  /**
   * Programa de Lealdade
   */
  async getClienteLealdade(clienteId: string) {
    // TODO: Implementar
    throw new Error('Not implemented')
  }

  /**
   * Reclamações
   */
  async getReclamacoes(companyId: string, limit?: number, offset?: number) {
    // TODO: Implementar
    throw new Error('Not implemented')
  }
}
