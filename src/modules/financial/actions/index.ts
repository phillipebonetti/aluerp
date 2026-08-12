'use server'

type CategoryInput = { name: string }
type Category = CategoryInput & { id: string; description?: string }
type ActionResult<T> = { data?: T; error?: string }

const incomeCategories: Category[] = []
const expenseCategories: Category[] = []

export async function listTransactions() {
  return []
}

export async function deleteTransaction(_id: string) {
  return { data: null }
}

export async function getIncomeCategories(): Promise<ActionResult<Category[]>> {
  return { data: incomeCategories }
}

export async function getExpenseCategories(): Promise<ActionResult<Category[]>> {
  return { data: expenseCategories }
}

export async function createIncomeCategory(input: CategoryInput): Promise<ActionResult<Category>> {
  const category = { id: crypto.randomUUID(), name: input.name }
  incomeCategories.push(category)
  return { data: category }
}

export async function createExpenseCategory(input: CategoryInput): Promise<ActionResult<Category>> {
  const category = { id: crypto.randomUUID(), name: input.name }
  expenseCategories.push(category)
  return { data: category }
}

export async function deleteIncomeCategory(id: string): Promise<ActionResult<null>> {
  const index = incomeCategories.findIndex((category) => category.id === id)
  if (index >= 0) incomeCategories.splice(index, 1)
  return { data: null }
}

export async function deleteExpenseCategory(id: string): Promise<ActionResult<null>> {
  const index = expenseCategories.findIndex((category) => category.id === id)
  if (index >= 0) expenseCategories.splice(index, 1)
  return { data: null }
}
