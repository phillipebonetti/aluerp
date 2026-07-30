'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { listTransactions, deleteTransaction } from '@/src/modules/financial/actions'
import type { TransactionWithRelations } from '@/src/repositories'

export function TransactionList() {
  const [transactions, setTransactions] = useState<TransactionWithRelations[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadTransactions()
  }, [])

  const loadTransactions = async () => {
    setLoading(true)
    const result = await listTransactions()
    if (result.data) {
      setTransactions(result.data as any)
    }
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar?')) return

    const result = await deleteTransaction(id)
    if (result.error) {
      alert(result.error)
      return
    }

    setTransactions(transactions.filter(t => t.id !== id))
  }

  if (loading) {
    return <div className="text-center py-4">Carregando...</div>
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Transações</h2>
      <div className="rounded-lg border overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-2 text-left">Data</th>
              <th className="px-4 py-2 text-left">Descrição</th>
              <th className="px-4 py-2 text-left">Tipo</th>
              <th className="px-4 py-2 text-right">Valor</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Cliente/Fornecedor</th>
              <th className="px-4 py-2 text-left">Ações</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map(tx => (
              <tr key={tx.id} className="border-b hover:bg-muted/30">
                <td className="px-4 py-2">{new Date(tx.dueDate).toLocaleDateString('pt-BR')}</td>
                <td className="px-4 py-2">{tx.description}</td>
                <td className="px-4 py-2">
                  <span className={tx.type === 'INCOME' ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                    {tx.type === 'INCOME' ? 'Receita' : 'Despesa'}
                  </span>
                </td>
                <td className="px-4 py-2 text-right font-medium">
                  R$ {(tx.amount as any).toFixed(2)}
                </td>
                <td className="px-4 py-2">
                  <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                    tx.status === 'PAID' ? 'bg-green-100 text-green-800' :
                    tx.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                    tx.status === 'OVERDUE' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {tx.status}
                  </span>
                </td>
                <td className="px-4 py-2 text-sm">
                  {tx.client?.name || tx.supplier?.name || '-'}
                </td>
                <td className="px-4 py-2">
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(tx.id)}
                    disabled={tx.status === 'PAID'}
                  >
                    Deletar
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {transactions.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          Nenhuma transação encontrada
        </div>
      )}
    </div>
  )
}
