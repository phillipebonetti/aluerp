// Integration Manager - Main service

import { IntegrationProvider, IntegrationStatus, type IIntegrationProvider } from './types'
import { getPrisma } from '@/src/core/database'
import { encryptData, decryptData } from '@/src/lib/crypto'

class IntegrationManager {
  private prisma = getPrisma()
  private providers: Map<IntegrationProvider, IIntegrationProvider> = new Map()

  // ==================== Lifecycle ====================

  async setupIntegration(
    companyId: string,
    provider: IntegrationProvider,
    credentials: Record<string, any>
  ) {
    try {
      const providerImpl = this.getProvider(provider)
      if (!providerImpl) throw new Error(`Provider ${provider} not implemented`)

      // Criptografar credenciais
      const encryptedCreds = encryptData(JSON.stringify(credentials))

      // Salvar integração
      const integration = await this.prisma.integration.upsert({
        where: { companyId_provider: { companyId, provider } },
        create: {
          companyId,
          provider,
          name: this.getProviderName(provider),
          credentials: encryptedCreds,
          status: IntegrationStatus.PENDING
        },
        update: {
          credentials: encryptedCreds,
          status: IntegrationStatus.PENDING
        }
      })

      // Testar conexão
      const connected = await providerImpl.testConnection()

      if (connected) {
        await this.prisma.integration.update({
          where: { id: integration.id },
          data: {
            status: IntegrationStatus.CONNECTED,
            enabledAt: new Date()
          }
        })
      }

      return integration
    } catch (error) {
      this.logError(companyId, provider, error)
      throw error
    }
  }

  async disconnectIntegration(companyId: string, provider: IntegrationProvider) {
    try {
      const integration = await this.prisma.integration.findUniqueOrThrow({
        where: { companyId_provider: { companyId, provider } }
      })

      const providerImpl = this.getProvider(provider)
      if (providerImpl) await providerImpl.disconnect()

      return await this.prisma.integration.update({
        where: { id: integration.id },
        data: {
          status: IntegrationStatus.DISCONNECTED,
          isActive: false,
          disabledAt: new Date()
        }
      })
    } catch (error) {
      this.logError(companyId, provider, error)
      throw error
    }
  }

  async testConnection(companyId: string, provider: IntegrationProvider) {
    try {
      const providerImpl = this.getProvider(provider)
      if (!providerImpl) throw new Error(`Provider ${provider} not implemented`)

      const success = await providerImpl.testConnection()

      if (success) {
        await this.prisma.integration.update({
          where: { companyId_provider: { companyId, provider } },
          data: { status: IntegrationStatus.CONNECTED }
        })
      }

      return success
    } catch (error) {
      this.logError(companyId, provider, error)
      return false
    }
  }

  // ==================== Sync ====================

  async syncIntegration(companyId: string, provider: IntegrationProvider) {
    try {
      const providerImpl = this.getProvider(provider)
      if (!providerImpl) throw new Error(`Provider ${provider} not implemented`)

      const result = await providerImpl.sync()

      await this.prisma.integration.update({
        where: { companyId_provider: { companyId, provider } },
        data: {
          lastSync: new Date(),
          ...(result.error && { lastError: result.error })
        }
      })

      this.logInfo(companyId, provider, `Sync completed: ${result.itemsSynced} synced, ${result.itemsFailed} failed`)

      return result
    } catch (error) {
      this.logError(companyId, provider, error)
      throw error
    }
  }

  // ==================== Status ====================

  async getIntegrationStatus(companyId: string, provider: IntegrationProvider) {
    const integration = await this.prisma.integration.findFirst({
      where: { companyId, provider }
    })

    if (!integration) return IntegrationStatus.DISCONNECTED

    return integration.status as IntegrationStatus
  }

  async listIntegrations(companyId: string) {
    return this.prisma.integration.findMany({
      where: { companyId },
      select: {
        id: true,
        provider: true,
        name: true,
        status: true,
        isActive: true,
        lastSync: true,
        lastError: true,
        enabledAt: true,
        _count: { select: { logs: true } }
      }
    })
  }

  // ==================== Logging ====================

  async logInfo(companyId: string, provider: IntegrationProvider, message: string, data?: any) {
    const integration = await this.prisma.integration.findFirst({
      where: { companyId, provider }
    })

    if (!integration) return

    await this.prisma.integrationLog.create({
      data: {
        integrationId: integration.id,
        level: 'INFO',
        errorMessage: message,
        metadata: data ? JSON.stringify(data) : null
      }
    })
  }

  async logError(companyId: string, provider: IntegrationProvider, error: any) {
    const integration = await this.prisma.integration.findFirst({
      where: { companyId, provider }
    })

    if (!integration) return

    const errorMessage = error instanceof Error ? error.message : String(error)

    await this.prisma.integrationLog.create({
      data: {
        integrationId: integration.id,
        level: 'ERROR',
        errorMessage,
        metadata: error instanceof Error ? JSON.stringify({ stack: error.stack }) : null
      }
    })

    // Atualizar status da integração
    await this.prisma.integration.update({
      where: { id: integration.id },
      data: { status: IntegrationStatus.ERROR, lastError: errorMessage }
    })
  }

  async getLogs(companyId: string, provider: IntegrationProvider, limit = 50) {
    const integration = await this.prisma.integration.findFirst({
      where: { companyId, provider }
    })

    if (!integration) return []

    return this.prisma.integrationLog.findMany({
      where: { integrationId: integration.id },
      orderBy: { createdAt: 'desc' },
      take: limit
    })
  }

  // ==================== Helpers ====================

  private getProvider(provider: IntegrationProvider): IIntegrationProvider | null {
    // Retorna implementação do provider
    // Por agora retorna null - será implementado nos próximos passos
    return null
  }

  private getProviderName(provider: IntegrationProvider): string {
    const names: Record<IntegrationProvider, string> = {
      [IntegrationProvider.WHATSAPP]: 'WhatsApp Business',
      [IntegrationProvider.EMAIL]: 'Email (SMTP)',
      [IntegrationProvider.GOOGLE_CALENDAR]: 'Google Calendar',
      [IntegrationProvider.GOOGLE_DRIVE]: 'Google Drive',
      [IntegrationProvider.CONTA_AZUL]: 'Conta Azul',
      [IntegrationProvider.PIX_BANKING]: 'PIX Bancário',
      [IntegrationProvider.BOLETO_BANKING]: 'Boleto Bancário',
      [IntegrationProvider.ZAPIER]: 'Zapier',
      [IntegrationProvider.MAKE]: 'Make',
      [IntegrationProvider.CUSTOM]: 'Integração Custom'
    }
    return names[provider] || provider
  }
}

export const integrationManager = new IntegrationManager()

// Webhook Manager
class WebhookManager {
  private prisma = getPrisma()

  async createWebhook(companyId: string, integrationId: string, url: string, events: string[]) {
    return this.prisma.webhook.create({
      data: {
        companyId,
        integrationId,
        url,
        events: JSON.stringify(events),
        secret: this.generateSecret()
      }
    })
  }

  async listWebhooks(integrationId: string) {
    return this.prisma.webhook.findMany({
      where: { integrationId },
      include: { deliveries: { orderBy: { createdAt: 'desc' }, take: 10 } }
    })
  }

  async triggerWebhook(webhookId: string, event: string, payload: Record<string, any>) {
    const webhook = await this.prisma.webhook.findUniqueOrThrow({
      where: { id: webhookId }
    })

    const events = JSON.parse(webhook.events)
    if (!events.includes(event)) return

    try {
      const response = await fetch(webhook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Signature': this.generateSignature(payload, webhook.secret || '')
        },
        body: JSON.stringify(payload)
      })

      await this.prisma.webhookDelivery.create({
        data: {
          webhookId,
          event,
          payload: JSON.stringify(payload),
          statusCode: response.status,
          responseBody: await response.text(),
          success: response.ok
        }
      })
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error)
      await this.prisma.webhookDelivery.create({
        data: {
          webhookId,
          event,
          payload: JSON.stringify(payload),
          success: false
        }
      })

      // Retry logic
      const failureCount = await this.prisma.webhookDelivery.count({
        where: { webhookId, success: false, event }
      })

      if (failureCount < (webhook.maxRetries || 3)) {
        const nextRetryAt = new Date(Date.now() + Math.pow(2, failureCount) * 60000) // Exponential backoff
        await this.prisma.webhook.update({
          where: { id: webhookId },
          data: { failureCount: failureCount + 1 }
        })
      }
    }
  }

  private generateSecret(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  }

  private generateSignature(payload: Record<string, any>, secret: string): string {
    // Implementar HMAC-SHA256
    return Buffer.from(JSON.stringify(payload) + secret).toString('base64')
  }
}

export const webhookManager = new WebhookManager()

// API Token Manager
class ApiTokenManager {
  private prisma = getPrisma()

  async createToken(companyId: string, userId: string, name: string, permissions: string[], expiresIn?: number) {
    const token = this.generateToken()
    const expiresAt = expiresIn ? new Date(Date.now() + expiresIn) : null

    return this.prisma.apiToken.create({
      data: {
        companyId,
        userId,
        name,
        token,
        permissions: JSON.stringify(permissions),
        expiresAt
      }
    })
  }

  async validateToken(token: string): Promise<{ valid: boolean; companyId?: string; permissions?: string[] }> {
    const apiToken = await this.prisma.apiToken.findUnique({
      where: { token }
    })

    if (!apiToken) return { valid: false }
    if (!apiToken.isActive) return { valid: false }
    if (apiToken.expiresAt && apiToken.expiresAt < new Date()) return { valid: false }

    return {
      valid: true,
      companyId: apiToken.companyId,
      permissions: JSON.parse(apiToken.permissions)
    }
  }

  async listTokens(companyId: string) {
    return this.prisma.apiToken.findMany({
      where: { companyId, isActive: true },
      select: {
        id: true,
        name: true,
        permissions: true,
        expiresAt: true,
        lastUsedAt: true,
        lastUsedIp: true,
        createdAt: true
      }
    })
  }

  async revokeToken(tokenId: string) {
    return this.prisma.apiToken.update({
      where: { id: tokenId },
      data: { isActive: false }
    })
  }

  private generateToken(): string {
    return 'aluerp_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  }
}

export const apiTokenManager = new ApiTokenManager()
