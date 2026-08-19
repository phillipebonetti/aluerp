'use server'

import { getSession } from '@/src/core/auth'
import { OSService } from '@/services'

/**
 * Recupera todas as OS da empresa
 */
export async function getAllOS() {
  const session = await getSession()
  if (!session || !session.company.id) {
    return { error: 'Unauthorized' }
  }

  try {
    const osService = new OSService()
    const orders = await osService.getAll({
      companyId: session.company.id,
    })

    return { data: orders }
  } catch (error: unknown) {
    return { error: error.message }
  }
}

/**
 * Recupera uma OS específica
 */
export async function getOSById(osId: string) {
  const session = await getSession()
  if (!session || !session.company.id) {
    return { error: 'Unauthorized' }
  }

  try {
    const osService = new OSService()
    const order = await osService.getById(osId, {
      companyId: session.company.id,
    })

    return { data: order }
  } catch (error: unknown) {
    return { error: error.message }
  }
}

/**
 * Cria uma nova OS
 */
export async function createOS(input: {
  projectId: string
  number: string
  scheduledDate?: string
  description?: string
  notes?: string
}) {
  const session = await getSession()
  if (!session || !session.company.id) {
    return { error: 'Unauthorized' }
  }

  try {
    const osService = new OSService()
    const order = await osService.create(
      {
        ...input,
        scheduledDate: input.scheduledDate ? new Date(input.scheduledDate) : undefined,
      },
      { companyId: session.company.id }
    )

    return { data: order }
  } catch (error: unknown) {
    return { error: error.message }
  }
}

/**
 * Atualiza uma OS
 */
export async function updateOS(
  osId: string,
  input: {
    number?: string
    status?: string
    scheduledDate?: string
    startDate?: string
    endDate?: string
    description?: string
    notes?: string
  }
) {
  const session = await getSession()
  if (!session || !session.company.id) {
    return { error: 'Unauthorized' }
  }

  try {
    const osService = new OSService()
    const order = await osService.update(
      osId,
      {
        ...input,
        scheduledDate: input.scheduledDate ? new Date(input.scheduledDate) : undefined,
        startDate: input.startDate ? new Date(input.startDate) : undefined,
        endDate: input.endDate ? new Date(input.endDate) : undefined,
      },
      { companyId: session.company.id }
    )

    return { data: order }
  } catch (error: unknown) {
    return { error: error.message }
  }
}

/**
 * Deleta uma OS
 */
export async function deleteOS(osId: string) {
  const session = await getSession()
  if (!session || !session.company.id) {
    return { error: 'Unauthorized' }
  }

  try {
    const osService = new OSService()
    const success = await osService.delete(osId, {
      companyId: session.company.id,
    })

    return { data: success }
  } catch (error: unknown) {
    return { error: error.message }
  }
}

/**
 * Inicia uma OS
 */
export async function startOS(osId: string) {
  const session = await getSession()
  if (!session || !session.company.id) {
    return { error: 'Unauthorized' }
  }

  try {
    const osService = new OSService()
    const order = await osService.start(osId, {
      companyId: session.company.id,
    })

    return { data: order }
  } catch (error: unknown) {
    return { error: error.message }
  }
}

/**
 * Conclui uma OS
 */
export async function completeOS(osId: string) {
  const session = await getSession()
  if (!session || !session.company.id) {
    return { error: 'Unauthorized' }
  }

  try {
    const osService = new OSService()
    const order = await osService.complete(osId, {
      companyId: session.company.id,
    })

    return { data: order }
  } catch (error: unknown) {
    return { error: error.message }
  }
}

/**
 * Cancela uma OS
 */
export async function cancelOS(osId: string) {
  const session = await getSession()
  if (!session || !session.company.id) {
    return { error: 'Unauthorized' }
  }

  try {
    const osService = new OSService()
    const order = await osService.cancel(osId, {
      companyId: session.company.id,
    })

    return { data: order }
  } catch (error: unknown) {
    return { error: error.message }
  }
}

/**
 * Recupera OS por projeto
 */
export async function getOSByProject(projectId: string) {
  const session = await getSession()
  if (!session || !session.company.id) {
    return { error: 'Unauthorized' }
  }

  try {
    const osService = new OSService()
    const orders = await osService.getByProject(projectId, {
      companyId: session.company.id,
    })

    return { data: orders }
  } catch (error: unknown) {
    return { error: error.message }
  }
}

/**
 * Lista OS abertas
 */
export async function getOpenOS() {
  const session = await getSession()
  if (!session || !session.company.id) {
    return { error: 'Unauthorized' }
  }

  try {
    const osService = new OSService()
    const orders = await osService.getOpen({
      companyId: session.company.id,
    })

    return { data: orders }
  } catch (error: unknown) {
    return { error: error.message }
  }
}

/**
 * Conta OS por status
 */
export async function countOSByStatus() {
  const session = await getSession()
  if (!session || !session.company.id) {
    return { error: 'Unauthorized' }
  }

  try {
    const osService = new OSService()
    const counts = await osService.countByStatus({
      companyId: session.company.id,
    })

    return { data: counts }
  } catch (error: unknown) {
    return { error: error.message }
  }
}

/**
 * Gera próximo número de OS
 */
export async function getNextOSNumber() {
  const session = await getSession()
  if (!session || !session.company.id) {
    return { error: 'Unauthorized' }
  }

  try {
    const osService = new OSService()
    const nextNumber = await osService.getNextNumber({
      companyId: session.company.id,
    })

    return { data: nextNumber }
  } catch (error: unknown) {
    return { error: error.message }
  }
}
