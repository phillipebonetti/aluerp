'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ExpenseCategoryList } from './expense-category-list'
import { IncomeCategoryList } from './income-category-list'

export function CategoriesTabs() {
  const [activeTab, setActiveTab] = useState<'expense' | 'income'>('expense')

  return (
    <div className="space-y-4">
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setActiveTab('expense')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'expense'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600'
          }`}
        >
          Despesas
        </button>
        <button
          onClick={() => setActiveTab('income')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'income'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600'
          }`}
        >
          Receitas
        </button>
      </div>

      {activeTab === 'expense' && <ExpenseCategoryList />}
      {activeTab === 'income' && <IncomeCategoryList />}
    </div>
  )
}
