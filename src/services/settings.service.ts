import { prisma } from '@/lib/prisma'
import { RepositoryOptions } from '@/repositories'

export interface CompanySettingsData {
  logo?: string
  razaoSocial?: string
  cnpj?: string
  email?: string
  whatsapp?: string
  comissaoPercentual?: number
  impostoPercentual?: number
  horarioAbertura?: string
  horarioFechamento?: string
  metaVendas?: number
  metaClientes?: number
  proximoNumeroOS?: number
  proximoNumeroOrcamento?: number
  proximoNumeroNota?: number
  assinaturaPadrao?: string
  carimboNota?: string
  rodapePadrao?: string
}

export class SettingsService {
  /**
   * Obtém as configurações da empresa
   */
  async getSettings(options: RepositoryOptions) {
    const settings = await prisma.companySetting.findUnique({
      where: { companyId: options.companyId },
    })

    return settings || this.createDefaultSettings(options.companyId)
  }

  /**
   * Atualiza as configurações da empresa
   */
  async updateSettings(options: RepositoryOptions, data: CompanySettingsData) {
    const existing = await prisma.companySetting.findUnique({
      where: { companyId: options.companyId },
    })

    if (!existing) {
      return prisma.companySetting.create({
        data: {
          companyId: options.companyId,
          ...data,
        },
      })
    }

    return prisma.companySetting.update({
      where: { companyId: options.companyId },
      data,
    })
  }

  /**
   * Incrementa o próximo número de documento
   */
  async getNextDocumentNumber(options: RepositoryOptions, type: 'OS' | 'ORCAMENTO' | 'NOTA') {
    const settings = await this.getSettings(options)
    
    let field: 'proximoNumeroOS' | 'proximoNumeroOrcamento' | 'proximoNumeroNota'
    switch (type) {
      case 'OS':
        field = 'proximoNumeroOS'
        break
      case 'ORCAMENTO':
        field = 'proximoNumeroOrcamento'
        break
      case 'NOTA':
        field = 'proximoNumeroNota'
        break
    }

    const updatedSettings = await prisma.companySetting.update({
      where: { companyId: options.companyId },
      data: {
        [field]: (settings[field] || 0) + 1,
      },
    })

    return settings[field] || 1
  }

  /**
   * Cria configurações padrão
   */
  private async createDefaultSettings(companyId: string) {
    return prisma.companySetting.create({
      data: {
        companyId,
        comissaoPercentual: 5.0,
        impostoPercentual: 15.0,
        horarioAbertura: '09:00',
        horarioFechamento: '18:00',
        proximoNumeroOS: 1,
        proximoNumeroOrcamento: 1,
        proximoNumeroNota: 1,
      },
    })
  }
}
