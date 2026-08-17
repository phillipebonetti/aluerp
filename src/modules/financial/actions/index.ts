'use server'

import { getSession } from '@/src/core/auth'
import { TransactionRepository } from '@/src/repositories/transaction.repository'
import { prisma } from '@/src/core/database'

type CategoryInput = { name: string }
type Category = CategoryInput & { id: string; description?: string }
type ActionResult<T> = { data?: T; error?: string }

async function getCompanyId() {
  const session = await getSession()
  return session?.company.id ?? null
}

export async function listTransactions() {
  const companyId = await getCompanyId()
  if (!companyId) return { data: [], error: 'Sessão não encontrada' }
  const repository = new TransactionRepository()
  const result = await repository.findAllWithRelations({ companyId }, 1, 100)
  return { data: result.data }
}

export async function deleteTransaction(id: string) {
  const companyId = await getCompanyId()
  if (!companyId) return { data: null, error: 'Sessão não encontrada' }
  const result = await prisma.transaction.deleteMany({
    where: { id, companyId },
  })
  return result.count ? { data: null } : { data: null, error: 'Transação não encontrada' }
}

export async function getIncomeCategories(): Promise<ActionResult<Category[]>> {
  return { error: 'Categorias de receita não estão disponíveis no schema atual' }
}

export async function getExpenseCategories(): Promise<ActionResult<Category[]>> {
  const companyId = await getCompanyId()
  if (!companyId) return { error: 'Sessão não encontrada' }
  const categories = await prisma.expenseCategory.findMany({
    where: { companyId, isActive: true },
    orderBy: { name: 'asc' },
  })
  return { data: categories }
}

export async function createIncomeCategory(): Promise<ActionResult<Category>> {
  return { error: 'Categorias de receita não estão disponíveis no schema atual' }
}

export async function createExpenseCategory(input: CategoryInput): Promise<ActionResult<Category>> {
  const companyId = await getCompanyId()
  if (!companyId) return { error: 'Sessão não encontrada' }
  const name = input.name.trim()
  if (!name) return { error: 'Nome da categoria é obrigatório' }
  const category = await prisma.expenseCategory.create({ data: { companyId, name } })
  return { data: category }
}

export async function deleteIncomeCategory(): Promise<ActionResult<null>> {
  return { error: 'Categorias de receita não estão disponíveis no schema atual' }
}

export async function deleteExpenseCategory(id: string): Promise<ActionResult<null>> {
  const companyId = await getCompanyId()
  if (!companyId) return { error: 'Sessão não encontrada' }
  const result = await prisma.expenseCategory.updateMany({
    where: { id, companyId, isActive: true },
    data: { isActive: false },
  })
  return result.count ? { data: null } : { error: 'Categoria não encontrada' }
}
