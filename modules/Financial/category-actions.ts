'use server'

import { getPrisma } from '@/src/core/database'
import { getSession } from '@/src/core/auth'
import { CreateCategorySchema, UpdateCategorySchema } from './category-schemas'
import type { CreateCategoryInput, UpdateCategoryInput } from './category-schemas'

export interface ActionResult<T = null> {
  data?: T
  error?: string
}

// ─────────────────────────────────────────────
// Expense Categories
// ─────────────────────────────────────────────

export async function getExpenseCategories(): Promise<ActionResult<any[]>> {
  try {
    const session = await getSession()
    if (!session?.company?.id) {
      return { error: 'Empresa não configurada' }
    }

    const prisma = await getPrisma()
    if (!prisma) {
      return { error: 'Serviço indisponível' }
    }

    const categories = await prisma.expenseCategory.findMany({
      where: { companyId: session.company.id },
      orderBy: { name: 'asc' },
    })

    return { data: categories }
  } catch (error) {
    return { error: 'Erro ao buscar categorias de despesa' }
  }
}

export async function createExpenseCategory(input: CreateCategoryInput): Promise<ActionResult<any>> {
  try {
    const session = await getSession()
    if (!session?.company?.id) {
      return { error: 'Empresa não configurada' }
    }

    const validated = CreateCategorySchema.parse(input)

    const prisma = await getPrisma()
    if (!prisma) {
      return { error: 'Serviço indisponível' }
    }

    // Check for duplicate
    const existing = await prisma.expenseCategory.findFirst({
      where: {
        companyId: session.company.id,
        name: validated.name,
      },
    })

    if (existing) {
      return { error: 'Categoria com este nome já existe' }
    }

    const category = await prisma.expenseCategory.create({
      data: {
        companyId: session.company.id,
        name: validated.name,
        description: validated.description,
      },
    })

    return { data: category }
  } catch (error: any) {
    if (error.issues) {
      return { error: error.issues[0]?.message || 'Erro de validação' }
    }
    return { error: 'Erro ao criar categoria' }
  }
}

export async function updateExpenseCategory(input: UpdateCategoryInput): Promise<ActionResult<any>> {
  try {
    const session = await getSession()
    if (!session?.company?.id) {
      return { error: 'Empresa não configurada' }
    }

    const validated = UpdateCategorySchema.parse(input)

    const prisma = await getPrisma()
    if (!prisma) {
      return { error: 'Serviço indisponível' }
    }

    // Check ownership
    const existing = await prisma.expenseCategory.findFirst({
      where: { id: validated.id, companyId: session.company.id },
    })

    if (!existing) {
      return { error: 'Categoria não encontrada' }
    }

    // Check for duplicate name
    if (validated.name !== existing.name) {
      const duplicate = await prisma.expenseCategory.findFirst({
        where: {
          companyId: session.company.id,
          name: validated.name,
          id: { not: validated.id },
        },
      })
      if (duplicate) {
        return { error: 'Categoria com este nome já existe' }
      }
    }

    const category = await prisma.expenseCategory.update({
      where: { id: validated.id },
      data: {
        name: validated.name,
        description: validated.description,
      },
    })

    return { data: category }
  } catch (error: any) {
    if (error.issues) {
      return { error: error.issues[0]?.message || 'Erro de validação' }
    }
    return { error: 'Erro ao atualizar categoria' }
  }
}

export async function deleteExpenseCategory(id: string): Promise<ActionResult> {
  try {
    const session = await getSession()
    if (!session?.company?.id) {
      return { error: 'Empresa não configurada' }
    }

    const prisma = await getPrisma()
    if (!prisma) {
      return { error: 'Serviço indisponível' }
    }

    // Check ownership
    const category = await prisma.expenseCategory.findFirst({
      where: { id, companyId: session.company.id },
    })

    if (!category) {
      return { error: 'Categoria não encontrada' }
    }

    // Check if has transactions
    const hasTransactions = await prisma.transaction.findFirst({
      where: { expenseCategoryId: id },
    })

    if (hasTransactions) {
      return { error: 'Não é possível deletar categoria vinculada a transações' }
    }

    await prisma.expenseCategory.delete({ where: { id } })

    return { data: null }
  } catch (error) {
    return { error: 'Erro ao deletar categoria' }
  }
}

// ─────────────────────────────────────────────
// Income Categories
// ─────────────────────────────────────────────

export async function getIncomeCategories(): Promise<ActionResult<any[]>> {
  try {
    const session = await getSession()
    if (!session?.company?.id) {
      return { error: 'Empresa não configurada' }
    }

    const prisma = await getPrisma()
    if (!prisma) {
      return { error: 'Serviço indisponível' }
    }

    const categories = await prisma.incomeCategory.findMany({
      where: { companyId: session.company.id },
      orderBy: { name: 'asc' },
    })

    return { data: categories }
  } catch (error) {
    return { error: 'Erro ao buscar categorias de receita' }
  }
}

export async function createIncomeCategory(input: CreateCategoryInput): Promise<ActionResult<any>> {
  try {
    const session = await getSession()
    if (!session?.company?.id) {
      return { error: 'Empresa não configurada' }
    }

    const validated = CreateCategorySchema.parse(input)

    const prisma = await getPrisma()
    if (!prisma) {
      return { error: 'Serviço indisponível' }
    }

    // Check for duplicate
    const existing = await prisma.incomeCategory.findFirst({
      where: {
        companyId: session.company.id,
        name: validated.name,
      },
    })

    if (existing) {
      return { error: 'Categoria com este nome já existe' }
    }

    const category = await prisma.incomeCategory.create({
      data: {
        companyId: session.company.id,
        name: validated.name,
        description: validated.description,
      },
    })

    return { data: category }
  } catch (error: any) {
    if (error.issues) {
      return { error: error.issues[0]?.message || 'Erro de validação' }
    }
    return { error: 'Erro ao criar categoria' }
  }
}

export async function updateIncomeCategory(input: UpdateCategoryInput): Promise<ActionResult<any>> {
  try {
    const session = await getSession()
    if (!session?.company?.id) {
      return { error: 'Empresa não configurada' }
    }

    const validated = UpdateCategorySchema.parse(input)

    const prisma = await getPrisma()
    if (!prisma) {
      return { error: 'Serviço indisponível' }
    }

    // Check ownership
    const existing = await prisma.incomeCategory.findFirst({
      where: { id: validated.id, companyId: session.company.id },
    })

    if (!existing) {
      return { error: 'Categoria não encontrada' }
    }

    // Check for duplicate name
    if (validated.name !== existing.name) {
      const duplicate = await prisma.incomeCategory.findFirst({
        where: {
          companyId: session.company.id,
          name: validated.name,
          id: { not: validated.id },
        },
      })
      if (duplicate) {
        return { error: 'Categoria com este nome já existe' }
      }
    }

    const category = await prisma.incomeCategory.update({
      where: { id: validated.id },
      data: {
        name: validated.name,
        description: validated.description,
      },
    })

    return { data: category }
  } catch (error: any) {
    if (error.issues) {
      return { error: error.issues[0]?.message || 'Erro de validação' }
    }
    return { error: 'Erro ao atualizar categoria' }
  }
}

export async function deleteIncomeCategory(id: string): Promise<ActionResult> {
  try {
    const session = await getSession()
    if (!session?.company?.id) {
      return { error: 'Empresa não configurada' }
    }

    const prisma = await getPrisma()
    if (!prisma) {
      return { error: 'Serviço indisponível' }
    }

    // Check ownership
    const category = await prisma.incomeCategory.findFirst({
      where: { id, companyId: session.company.id },
    })

    if (!category) {
      return { error: 'Categoria não encontrada' }
    }

    // Check if has transactions
    const hasTransactions = await prisma.transaction.findFirst({
      where: { incomeCategoryId: id },
    })

    if (hasTransactions) {
      return { error: 'Não é possível deletar categoria vinculada a transações' }
    }

    await prisma.incomeCategory.delete({ where: { id } })

    return { data: null }
  } catch (error) {
    return { error: 'Erro ao deletar categoria' }
  }
}
