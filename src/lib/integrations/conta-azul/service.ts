'use server'

import { prisma } from '@/src/lib/prisma'

interface ContaAzulConfig {
  clientId: string
  clientSecret: string
  accessToken: string
  refreshToken: string
}

interface SyncResult {
  entity: string
  imported: number
  updated: number
  failed: number
  errors: string[]
}

class ContaAzulService {
  private readonly apiUrl = 'https://api.contaazul.com/v1'
  private config: ContaAzulConfig | null = null

  async setConfig(config: ContaAzulConfig) {
    this.config = config
  }

  private async makeRequest(endpoint: string, method = 'GET', data?: any) {
    if (!this.config?.accessToken) throw new Error('Not configured')

    const response = await fetch(`${this.apiUrl}${endpoint}`, {
      method,
      headers: {
        'Authorization': `Bearer ${this.config.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: data ? JSON.stringify(data) : undefined,
    })

    if (!response.ok) {
      if (response.status === 401) {
        await this.refreshAccessToken()
        return this.makeRequest(endpoint, method, data)
      }
      throw new Error(`API Error: ${response.statusText}`)
    }

    return response.json()
  }

  private async refreshAccessToken() {
    if (!this.config) throw new Error('Config not set')

    const response = await fetch('https://api.contaazul.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'refresh_token',
        refresh_token: this.config.refreshToken,
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
      }),
    })

    const data = await response.json()
    this.config.accessToken = data.access_token
    this.config.refreshToken = data.refresh_token
  }

  async syncClientes(companyId: string): Promise<SyncResult> {
    const result: SyncResult = { entity: 'Clientes', imported: 0, updated: 0, failed: 0, errors: [] }

    try {
      const data = await this.makeRequest('/pessoas?filter=tipo:cliente')
      
      for (const cliente of data.data) {
        try {
          await prisma.client.upsert({
            where: { externalId: cliente.id },
            update: {
              name: cliente.nome,
              email: cliente.email,
              phone: cliente.telefone,
              document: cliente.documento,
            },
            create: {
              companyId,
              externalId: cliente.id,
              name: cliente.nome,
              email: cliente.email,
              phone: cliente.telefone,
              document: cliente.documento,
            },
          })
          result.imported++
        } catch (err) {
          result.failed++
          result.errors.push(`Cliente ${cliente.id}: ${String(err)}`)
        }
      }
    } catch (err) {
      result.errors.push(`Sync error: ${String(err)}`)
    }

    return result
  }

  async syncFornecedores(companyId: string): Promise<SyncResult> {
    const result: SyncResult = { entity: 'Fornecedores', imported: 0, updated: 0, failed: 0, errors: [] }

    try {
      const data = await this.makeRequest('/pessoas?filter=tipo:fornecedor')
      
      for (const fornecedor of data.data) {
        try {
          await prisma.supplier.upsert({
            where: { externalId: fornecedor.id },
            update: {
              name: fornecedor.nome,
              email: fornecedor.email,
              phone: fornecedor.telefone,
              document: fornecedor.documento,
            },
            create: {
              companyId,
              externalId: fornecedor.id,
              name: fornecedor.nome,
              email: fornecedor.email,
              phone: fornecedor.telefone,
              document: fornecedor.documento,
            },
          })
          result.imported++
        } catch (err) {
          result.failed++
          result.errors.push(`Fornecedor ${fornecedor.id}: ${String(err)}`)
        }
      }
    } catch (err) {
      result.errors.push(`Sync error: ${String(err)}`)
    }

    return result
  }

  async syncProdutos(companyId: string): Promise<SyncResult> {
    const result: SyncResult = { entity: 'Produtos', imported: 0, updated: 0, failed: 0, errors: [] }

    try {
      const data = await this.makeRequest('/produtos')
      
      for (const produto of data.data) {
        try {
          await prisma.product.upsert({
            where: { externalId: produto.id },
            update: {
              name: produto.nome,
              description: produto.descricao,
              price: parseFloat(produto.preco),
              sku: produto.codigo,
            },
            create: {
              companyId,
              externalId: produto.id,
              name: produto.nome,
              description: produto.descricao,
              price: parseFloat(produto.preco),
              sku: produto.codigo,
            },
          })
          result.imported++
        } catch (err) {
          result.failed++
          result.errors.push(`Produto ${produto.id}: ${String(err)}`)
        }
      }
    } catch (err) {
      result.errors.push(`Sync error: ${String(err)}`)
    }

    return result
  }

  async syncCategorias(companyId: string): Promise<SyncResult> {
    const result: SyncResult = { entity: 'Categorias', imported: 0, updated: 0, failed: 0, errors: [] }
    try {
      const data = await this.makeRequest('/categorias')
      result.imported = data.data?.length || 0
    } catch (err) {
      result.errors.push(`Sync error: ${String(err)}`)
    }
    return result
  }

  async syncNotasFiscais(companyId: string): Promise<SyncResult> {
    const result: SyncResult = { entity: 'Notas Fiscais', imported: 0, updated: 0, failed: 0, errors: [] }
    try {
      const data = await this.makeRequest('/notas-fiscais')
      result.imported = data.data?.length || 0
    } catch (err) {
      result.errors.push(`Sync error: ${String(err)}`)
    }
    return result
  }

  async syncContasPagar(companyId: string): Promise<SyncResult> {
    const result: SyncResult = { entity: 'Contas a Pagar', imported: 0, updated: 0, failed: 0, errors: [] }
    try {
      const data = await this.makeRequest('/contas-pagar')
      result.imported = data.data?.length || 0
    } catch (err) {
      result.errors.push(`Sync error: ${String(err)}`)
    }
    return result
  }

  async syncContasReceber(companyId: string): Promise<SyncResult> {
    const result: SyncResult = { entity: 'Contas a Receber', imported: 0, updated: 0, failed: 0, errors: [] }
    try {
      const data = await this.makeRequest('/contas-receber')
      result.imported = data.data?.length || 0
    } catch (err) {
      result.errors.push(`Sync error: ${String(err)}`)
    }
    return result
  }

  async syncCentrosCusto(companyId: string): Promise<SyncResult> {
    const result: SyncResult = { entity: 'Centros de Custo', imported: 0, updated: 0, failed: 0, errors: [] }
    try {
      const data = await this.makeRequest('/centros-custo')
      result.imported = data.data?.length || 0
    } catch (err) {
      result.errors.push(`Sync error: ${String(err)}`)
    }
    return result
  }

  async syncAll(companyId: string) {
    const results = await Promise.all([
      this.syncClientes(companyId),
      this.syncFornecedores(companyId),
      this.syncProdutos(companyId),
      this.syncCategorias(companyId),
      this.syncNotasFiscais(companyId),
      this.syncContasPagar(companyId),
      this.syncContasReceber(companyId),
      this.syncCentrosCusto(companyId),
    ])

    return results
  }
}

export const contaAzulService = new ContaAzulService()
