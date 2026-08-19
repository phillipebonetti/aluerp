'use server'

import { getSession } from '@/src/core/auth'
import { ClientService } from '@/services'

export async function getClientsWithAnalysis() {
  const session = await getSession()
  if (!session || !session.company.id) {
    return { error: 'Unauthorized' }
  }

  try {
    const clientService = new ClientService()
    const clients = await clientService.getClientsWithAnalysis({
      companyId: session.company.id,
    })

    return { data: clients }
  } catch (error: unknown) {
    return { error: error.message }
  }
}

export async function getActiveClientsCount() {
  const session = await getSession()
  if (!session || !session.company.id) {
    return { error: 'Unauthorized' }
  }

  try {
    const clientService = new ClientService()
    const count = await clientService.getActiveClientsCount({
      companyId: session.company.id,
    })

    return { data: count }
  } catch (error: unknown) {
    return { error: error.message }
  }
}

export async function getClientBalance(clientId: string) {
  const session = await getSession()
  if (!session || !session.company.id) {
    return { error: 'Unauthorized' }
  }

  try {
    const clientService = new ClientService()
    const balance = await clientService.calculateClientBalance(clientId, {
      companyId: session.company.id,
    })

    return { data: balance }
  } catch (error: unknown) {
    return { error: error.message }
  }
}
