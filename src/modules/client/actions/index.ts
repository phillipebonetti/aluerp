'use server'

import { getCurrentUser } from '@/src/core/auth'
import { ClientService } from '@/services'

export async function getClientsWithAnalysis() {
  const user = await getCurrentUser()
  if (!user || !user.companyId) {
    return { error: 'Unauthorized' }
  }

  try {
    const clientService = new ClientService()
    const clients = await clientService.getClientsWithAnalysis({
      companyId: user.companyId,
    })

    return { data: clients }
  } catch (error: any) {
    return { error: error.message }
  }
}

export async function getActiveClientsCount() {
  const user = await getCurrentUser()
  if (!user || !user.companyId) {
    return { error: 'Unauthorized' }
  }

  try {
    const clientService = new ClientService()
    const count = await clientService.getActiveClientsCount({
      companyId: user.companyId,
    })

    return { data: count }
  } catch (error: any) {
    return { error: error.message }
  }
}

export async function getClientBalance(clientId: string) {
  const user = await getCurrentUser()
  if (!user || !user.companyId) {
    return { error: 'Unauthorized' }
  }

  try {
    const clientService = new ClientService()
    const balance = await clientService.calculateClientBalance(clientId, {
      companyId: user.companyId,
    })

    return { data: balance }
  } catch (error: any) {
    return { error: error.message }
  }
}
