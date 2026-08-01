'use server'

import { prisma } from '@/src/lib/prisma'
import { getCurrentUser } from '@/src/lib/auth'
import { contaAzulService } from '@/src/lib/integrations/conta-azul/service'

export async function saveContaAzulConfig(clientId: string, clientSecret: string, accessToken: string, refreshToken: string) {
  const user = await getCurrentUser()
  if (!user?.id || user.role !== 'ADMIN') return { success: false, error: 'Unauthorized' }

  try {
    await contaAzulService.setConfig({
      clientId,
      clientSecret,
      accessToken,
      refreshToken,
    })

    await prisma.integration.upsert({
      where: { companyId_provider: { companyId: user.companyId, provider: 'CONTA_AZUL' } },
      update: {
        accessToken,
        refreshToken,
        isActive: true,
        lastSyncAt: new Date(),
      },
      create: {
        companyId: user.companyId,
        provider: 'CONTA_AZUL',
        clientId,
        clientSecret,
        accessToken,
        refreshToken,
        isActive: true,
      },
    })

    return { success: true }
  } catch (error) {
    return { success: false, error: String(error) }
  }
}

export async function syncContaAzulData(entities: string[]) {
  const user = await getCurrentUser()
  if (!user?.id || user.role !== 'ADMIN') return { success: false, error: 'Unauthorized' }

  try {
    const config = await prisma.integration.findUnique({
      where: { companyId_provider: { companyId: user.companyId, provider: 'CONTA_AZUL' } },
    })

    if (!config?.accessToken) return { success: false, error: 'Not configured' }

    await contaAzulService.setConfig({
      clientId: config.clientId,
      clientSecret: config.clientSecret,
      accessToken: config.accessToken,
      refreshToken: config.refreshToken,
    })

    const results = await contaAzulService.syncAll(user.companyId)

    // Log sync
    await prisma.integrationLog.create({
      data: {
        integrationId: config.id,
        action: 'SYNC',
        status: 'SUCCESS',
        details: JSON.stringify(results),
      },
    })

    return { success: true, data: results }
  } catch (error) {
    return { success: false, error: String(error) }
  }
}

export async function getContaAzulStatus() {
  const user = await getCurrentUser()
  if (!user?.id) return { success: false, error: 'Not authenticated' }

  try {
    const integration = await prisma.integration.findUnique({
      where: { companyId_provider: { companyId: user.companyId, provider: 'CONTA_AZUL' } },
    })

    return {
      success: true,
      data: {
        configured: !!integration?.accessToken,
        isActive: integration?.isActive || false,
        lastSyncAt: integration?.lastSyncAt,
      },
    }
  } catch (error) {
    return { success: false, error: String(error) }
  }
}
