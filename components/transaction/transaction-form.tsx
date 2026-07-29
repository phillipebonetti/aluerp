'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { TransactionActions } from '@/modules/Transaction'

interface TransactionFormProps {
  onSuccess?: () => void
  onCancel?: () => void
}

export function TransactionForm({ onSuccess, onCancel }: TransactionFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const input = {
      type: formData.get('type') as 'INCOME' | 'EXPENSE',
      amount: parseFloat(formData.get('amount') as string),
      description: formData.get('description') as string,
      paymentMethod: formData.get('paymentMethod') as 'CASH' | 'CHECK' | 'TRANSFER' | 'CREDIT_CARD' | 'PIX',
      dueDate: new Date(formData.get('dueDate') as string),
      status: (formData.get('status') as 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED') || 'PENDING',
      clientId: (formData.get('clientId') as string) || undefined,
      projectId: (formData.get('projectId') as string) || undefined,
      salespersonId: (formData.get('salespersonId') as string) || undefined,
      notes: (formData.get('notes') as string) || undefined,
    }

    const result = await TransactionActions.createTransaction(input)
    if (result.error) {
      setError(result.error)
    } else {
      onSuccess?.()
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Tipo</label>
          <select name="type" className="w-full px-3 py-2 border rounded" required>
            <option value="INCOME">Receita</option>
            <option value="EXPENSE">Despesa</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-medium">Valor</label>
          <Input
            name="amount"
            type="number"
            step="0.01"
            placeholder="0.00"
            required
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">Descrição</label>
        <Input
          name="description"
          placeholder="Ex: Pagamento de fornecedor"
          minLength={3}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Método de Pagamento</label>
          <select name="paymentMethod" className="w-full px-3 py-2 border rounded" required>
            <option value="CASH">Dinheiro</option>
            <option value="CHECK">Cheque</option>
            <option value="TRANSFER">Transferência</option>
            <option value="CREDIT_CARD">Cartão Crédito</option>
            <option value="PIX">PIX</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-medium">Data de Vencimento</label>
          <Input
            name="dueDate"
            type="date"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Status</label>
          <select name="status" className="w-full px-3 py-2 border rounded">
            <option value="PENDING">Pendente</option>
            <option value="PAID">Pago</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-medium">Notas</label>
          <Input name="notes" placeholder="Observações (opcional)" />
        </div>
      </div>

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Salvando...' : 'Salvar'}
        </Button>
      </div>
    </form>
  )
}
