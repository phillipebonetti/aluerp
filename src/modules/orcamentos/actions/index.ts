'use server'

import { getCurrentUser } from '@/src/core/auth'
import { BudgetService } from '@/src/services'

/**
 * Recupera todos os orçamentos da empresa
 */
export async function getAllBudgets() {
  const user = await getCurrentUser()
  if (!user || !user.companyId) {
    return { error: 'Unauthorized' }
  }

  try {
    const budgetService = new BudgetService()
    const budgets = await budgetService.getAll({
      companyId: user.companyId,
    })

    return { data: budgets }
  } catch (error: any) {
    return { error: error.message }
  }
}

/**
 * Recupera um orçamento específico
 */
export async function getBudgetById(budgetId: string) {
  const user = await getCurrentUser()
  if (!user || !user.companyId) {
    return { error: 'Unauthorized' }
  }

  try {
    const budgetService = new BudgetService()
    const budget = await budgetService.getById(budgetId, {
      companyId: user.companyId,
    })

    return { data: budget }
  } catch (error: any) {
    return { error: error.message }
  }
}

/**
 * Cria um novo orçamento
 */
export async function createBudget(input: {
  clientId: string
  projectId?: string
  number: string
  totalValue: number
  salespersonId?: string
  validUntil?: string
  notes?: string
}) {
  const user = await getCurrentUser()
  if (!user || !user.companyId) {
    return { error: 'Unauthorized' }
  }

  try {
    const budgetService = new BudgetService()
    const budget = await budgetService.create(
      {
        ...input,
        validUntil: input.validUntil ? new Date(input.validUntil) : undefined,
      },
      { companyId: user.companyId }
    )

    return { data: budget }
  } catch (error: any) {
    return { error: error.message }
  }
}

export async function createBudgetWithItems(input: {
  clientId: string
  salespersonId?: string
  projectId?: string
  validUntil: string
  notes?: string
  items: Array<{ description: string; quantity: number; unitPrice: number; discount?: number }>
}) {
  const user = await getCurrentUser()
  if (!user?.companyId) return { error: 'Unauthorized' }
  if (!input.items.length) return { error: 'Adicione pelo menos um item' }

  try {
    const { prisma } = await import('@/src/core/database')
    const last = await prisma.quote.findFirst({
      where: { companyId: user.companyId },
      orderBy: { createdAt: 'desc' },
      select: { number: true },
    })
    const nextNumber = String((Number(last?.number) || 0) + 1).padStart(6, '0')
    const totalValue = input.items.reduce((sum, item) => {
      const gross = item.quantity * item.unitPrice
      return sum + gross - gross * ((item.discount ?? 0) / 100)
    }, 0)

    const quote = await prisma.$transaction(async (tx) => {
      const created = await tx.quote.create({
        data: {
          companyId: user.companyId,
          clientId: input.clientId,
          projectId: input.projectId || null,
          salespersonId: input.salespersonId || null,
          number: nextNumber,
          totalValue,
          validUntil: new Date(input.validUntil),
          notes: input.notes?.trim() || null,
          status: 'DRAFT',
          items: {
            create: input.items.map((item, index) => {
              const gross = item.quantity * item.unitPrice
              const totalPrice = gross - gross * ((item.discount ?? 0) / 100)
              return { description: item.description.trim(), quantity: item.quantity, unitPrice: item.unitPrice, totalPrice, discount: item.discount ?? 0, order: index + 1 }
            }),
          },
        },
        include: { client: true, items: true },
      })
      return created
    })
    return { data: quote }
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Erro ao criar orçamento' }
  }
}

/**
 * Atualiza um orçamento
 */
export async function updateBudget(
  budgetId: string,
  input: {
    number?: string
    totalValue?: number
    status?: string
    validUntil?: string
    notes?: string
  }
) {
  const user = await getCurrentUser()
  if (!user || !user.companyId) {
    return { error: 'Unauthorized' }
  }

  try {
    const budgetService = new BudgetService()
    const budget = await budgetService.update(
      budgetId,
      {
        ...input,
        validUntil: input.validUntil ? new Date(input.validUntil) : undefined,
      },
      { companyId: user.companyId }
    )

    return { data: budget }
  } catch (error: any) {
    return { error: error.message }
  }
}

/**
 * Deleta um orçamento
 */
export async function deleteBudget(budgetId: string) {
  const user = await getCurrentUser()
  if (!user || !user.companyId) {
    return { error: 'Unauthorized' }
  }

  try {
    const budgetService = new BudgetService()
    const success = await budgetService.delete(budgetId, {
      companyId: user.companyId,
    })

    return { data: success }
  } catch (error: any) {
    return { error: error.message }
  }
}

/**
 * Aprova um orçamento
 */
export async function approveBudget(budgetId: string) {
  const user = await getCurrentUser()
  if (!user || !user.companyId) {
    return { error: 'Unauthorized' }
  }

  try {
    const budgetService = new BudgetService()
    const budget = await budgetService.approve(budgetId, {
      companyId: user.companyId,
    })

    return { data: budget }
  } catch (error: any) {
    return { error: error.message }
  }
}

/**
 * Rejeita um orçamento
 */
export async function rejectBudget(budgetId: string) {
  const user = await getCurrentUser()
  if (!user || !user.companyId) {
    return { error: 'Unauthorized' }
  }

  try {
    const budgetService = new BudgetService()
    const budget = await budgetService.reject(budgetId, {
      companyId: user.companyId,
    })

    return { data: budget }
  } catch (error: any) {
    return { error: error.message }
  }
}

/**
 * Envia um orçamento
 */
export async function sendBudget(budgetId: string) {
  const user = await getCurrentUser()
  if (!user || !user.companyId) {
    return { error: 'Unauthorized' }
  }

  try {
    const budgetService = new BudgetService()
    const budget = await budgetService.send(budgetId, {
      companyId: user.companyId,
    })

    return { data: budget }
  } catch (error: any) {
    return { error: error.message }
  }
}

/**
 * Recupera orçamentos por cliente
 */
export async function getBudgetsByClient(clientId: string) {
  const user = await getCurrentUser()
  if (!user || !user.companyId) {
    return { error: 'Unauthorized' }
  }

  try {
    const budgetService = new BudgetService()
    const budgets = await budgetService.getByClient(clientId, {
      companyId: user.companyId,
    })

    return { data: budgets }
  } catch (error: any) {
    return { error: error.message }
  }
}

/**
 * Conta orçamentos por status
 */
export async function countBudgetsByStatus() {
  const user = await getCurrentUser()
  if (!user || !user.companyId) {
    return { error: 'Unauthorized' }
  }

  try {
    const budgetService = new BudgetService()
    const counts = await budgetService.countByStatus({
      companyId: user.companyId,
    })

    return { data: counts }
  } catch (error: any) {
    return { error: error.message }
  }
}
