'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import * as FinancialActions from '@/modules/Financial/category-actions'

interface Category {
  id: string
  name: string
  description?: string
}

const DEFAULT_CATEGORIES = [
  { id: '1', name: 'Materiais' },
  { id: '2', name: 'Vidros' },
  { id: '3', name: 'Alumínio' },
  { id: '4', name: 'Ferragens' },
  { id: '5', name: 'Combustível' },
  { id: '6', name: 'Salários' },
  { id: '7', name: 'Marketing' },
  { id: '8', name: 'Energia' },
  { id: '9', name: 'Água' },
  { id: '10', name: 'Impostos' },
  { id: '11', name: 'Serviços' },
]

export function ExpenseCategoryList() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [newCategoryName, setNewCategoryName] = useState('')

  useEffect(() => {
    loadCategories()
  }, [])

  async function loadCategories() {
    setLoading(true)
    const result = await FinancialActions.getExpenseCategories()
    if (result.data) {
      setCategories(result.data)
    } else if (result.error === 'Empresa não configurada') {
      // Use defaults in preview mode
      setCategories(DEFAULT_CATEGORIES)
    }
    setLoading(false)
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!newCategoryName.trim()) return

    const result = await FinancialActions.createExpenseCategory({
      name: newCategoryName,
    })

    if (!result.error) {
      setNewCategoryName('')
      await loadCategories()
    }
  }

  async function handleDelete(id: string) {
    if (confirm('Tem certeza que deseja deletar esta categoria?')) {
      await FinancialActions.deleteExpenseCategory(id)
      await loadCategories()
    }
  }

  if (loading) {
    return <div className="text-center py-8">Carregando...</div>
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleCreate} className="flex gap-2">
        <Input
          type="text"
          placeholder="Nova categoria de despesa"
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
        />
        <Button type="submit">Adicionar</Button>
      </form>

      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Nome</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {categories.map((category) => (
              <tr key={category.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium">{category.name}</td>
                <td className="px-6 py-4 text-sm">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(category.id)}
                  >
                    Deletar
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {categories.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          Nenhuma categoria cadastrada
        </div>
      )}
    </div>
  )
}
