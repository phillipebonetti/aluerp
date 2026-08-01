'use server'

import { integrationManager, webhookManager, apiTokenManager } from '@/src/lib/integrations'
import { IntegrationProvider } from '@/src/lib/integrations/types'

// ==================== Integration Management ====================

export async function setupIntegrationAction(
  companyId: string,
  provider: IntegrationProvider,
  credentials: Record<string, any>
) {
  try {
    const integration = await integrationManager.setupIntegration(
      companyId,
      provider,
      credentials
    )
    return { success: true, data: integration }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao configurar integração'
    return { success: false, error: message }
  }
}

export async function disconnectIntegrationAction(
  companyId: string,
  provider: IntegrationProvider
) {
  try {
    const integration = await integrationManager.disconnectIntegration(companyId, provider)
    return { success: true, data: integration }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao desconectar integração'
    return { success: false, error: message }
  }
}

export async function testConnectionAction(
  companyId: string,
  provider: IntegrationProvider
) {
  try {
    const success = await integrationManager.testConnection(companyId, provider)
    return { success: true, connected: success }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao testar conexão'
    return { success: false, error: message }
  }
}

export async function syncIntegrationAction(
  companyId: string,
  provider: IntegrationProvider
) {
  try {
    const result = await integrationManager.syncIntegration(companyId, provider)
    return { success: true, data: result }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao sincronizar'
    return { success: false, error: message }
  }
}

export async function listIntegrationsAction(companyId: string) {
  try {
    const integrations = await integrationManager.listIntegrations(companyId)
    return { success: true, data: integrations }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao listar integrações'
    return { success: false, error: message }
  }
}

export async function getIntegrationLogsAction(
  companyId: string,
  provider: IntegrationProvider,
  limit = 50
) {
  try {
    const logs = await integrationManager.getLogs(companyId, provider, limit)
    return { success: true, data: logs }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao obter logs'
    return { success: false, error: message }
  }
}

// ==================== Webhook Management ====================

export async function createWebhookAction(
  companyId: string,
  integrationId: string,
  url: string,
  events: string[]
) {
  try {
    const webhook = await webhookManager.createWebhook(
      companyId,
      integrationId,
      url,
      events
    )
    return { success: true, data: webhook }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao criar webhook'
    return { success: false, error: message }
  }
}

export async function listWebhooksAction(integrationId: string) {
  try {
    const webhooks = await webhookManager.listWebhooks(integrationId)
    return { success: true, data: webhooks }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao listar webhooks'
    return { success: false, error: message }
  }
}

// ==================== API Token Management ====================

export async function createApiTokenAction(
  companyId: string,
  userId: string,
  name: string,
  permissions: string[],
  expiresIn?: number
) {
  try {
    const token = await apiTokenManager.createToken(
      companyId,
      userId,
      name,
      permissions,
      expiresIn
    )
    return { success: true, data: token }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao criar token'
    return { success: false, error: message }
  }
}

export async function listApiTokensAction(companyId: string) {
  try {
    const tokens = await apiTokenManager.listTokens(companyId)
    return { success: true, data: tokens }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao listar tokens'
    return { success: false, error: message }
  }
}

export async function revokeApiTokenAction(tokenId: string) {
  try {
    const token = await apiTokenManager.revokeToken(tokenId)
    return { success: true, data: token }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao revogar token'
    return { success: false, error: message }
  }
}
