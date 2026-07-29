'use client'

import { useState, useTransition } from 'react'
import { despesaFormSchema, type DespesaFormData } from '@/src/lib/validations/forms'
import { FormField, FormSectionGroup, FormActions } from '@/components/ui/form-field'
import { Input } from '@/components/ui/input'

interface DespesaFormProps {
  initialData?: DespesaFormData
  onSubmit: (data: DespesaFormData) => Promise<{ success?: boolean; error?: string }>
  onCancel?: () => void
}

export function DespesaForm({ initialData, onSubmit, onCancel }: DespesaFormProps) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState<Partial<DespesaFormData>>(initialData || {})

  const handleChange = (field: keyof DespesaFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors(prev => { const { [field]: _, ...rest } = prev; return rest })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    startTransition(async () => {
      try {
        const validatedData = despesaFormSchema.parse(formData)
        const result = await onSubmit(validatedData)
        if (result.error) setError(result.error)
      } catch (err: any) {
        if (err.errors) {
          const fieldErrors: Record<string, string> = {}
          err.errors.forEach((e: any) => fieldErrors[e.path[0]] = e.message)
          setErrors(fieldErrors)
        } else {
          setError(err.message)
        }
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-6 space-y-6">
      {error && (
        <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2.5">
          {error}
        </div>
      )}

      <FormSectionGroup title="Despesa">
        <FormField label="Descrição" error={errors.description ? { message: errors.description } : undefined} required className="md:col-span-2">
          <Input
            value={formData.description || ''}
            onChange={e => handleChange('description', e.target.value)}
            placeholder="Descrição da despesa"
            disabled={isPending}
          />
        </FormField>

        <FormField label="Valor" error={errors.amount ? { message: errors.amount } : undefined} required>
          <Input
            type="text"
            value={formData.amount || ''}
            onChange={e => handleChange('amount', parseFloat(e.target.value.replace(/\D/g, '')) / 100)}
            placeholder="0,00"
            disabled={isPending}
          />
        </FormField>

        <FormField label="Categoria" error={errors.category ? { message: errors.category } : undefined} required>
          <select
            value={formData.category || ''}
            onChange={e => handleChange('category', e.target.value)}
            disabled={isPending}
            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50"
          >
            <option value="">Selecione...</option>
            <option value="MATERIAL">Material</option>
            <option value="LABOR">Mão de Obra</option>
            <option value="EQUIPMENT">Equipamento</option>
            <option value="TRANSPORT">Transporte</option>
            <option value="OTHER">Outro</option>
          </select>
        </FormField>

        <FormField label="Data" error={errors.date ? { message: errors.date } : undefined} required>
          <Input
            type="date"
            value={formData.date ? new Date(formData.date).toISOString().split('T')[0] : ''}
            onChange={e => handleChange('date', e.target.value)}
            disabled={isPending}
          />
        </FormField>

        <FormField label="Data de Vencimento">
          <Input
            type="date"
            value={formData.dueDate ? new Date(formData.dueDate).toISOString().split('T')[0] : ''}
            onChange={e => handleChange('dueDate', e.target.value)}
            disabled={isPending}
          />
        </FormField>

        <FormField label="Método de Pagamento" error={errors.paymentMethod ? { message: errors.paymentMethod } : undefined} required>
          <select
            value={formData.paymentMethod || ''}
            onChange={e => handleChange('paymentMethod', e.target.value)}
            disabled={isPending}
            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50"
          >
            <option value="">Selecione...</option>
            <option value="CASH">Dinheiro</option>
            <option value="CHECK">Cheque</option>
            <option value="TRANSFER">Transferência</option>
            <option value="CREDIT_CARD">Cartão de Crédito</option>
            <option value="PIX">PIX</option>
          </select>
        </FormField>

        <FormField label="Status" error={errors.status ? { message: errors.status } : undefined} required>
          <select
            value={formData.status || 'PENDING'}
            onChange={e => handleChange('status', e.target.value)}
            disabled={isPending}
            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50"
          >
            <option value="PENDING">Pendente</option>
            <option value="PAID">Pago</option>
            <option value="OVERDUE">Vencido</option>
            <option value="CANCELLED">Cancelado</option>
          </select>
        </FormField>

        <FormField label="Fornecedor">
          <Input
            value={formData.supplierId || ''}
            onChange={e => handleChange('supplierId', e.target.value)}
            placeholder="ID do fornecedor"
            disabled={isPending}
          />
        </FormField>

        <FormField label="Projeto">
          <Input
            value={formData.projectId || ''}
            onChange={e => handleChange('projectId', e.target.value)}
            placeholder="ID do projeto"
            disabled={isPending}
          />
        </FormField>

        <FormField label="Observações" className="md:col-span-2">
          <textarea
            value={formData.notes || ''}
            onChange={e => handleChange('notes', e.target.value)}
            placeholder="Observações..."
            disabled={isPending}
            rows={2}
            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50"
          />
        </FormField>
      </FormSectionGroup>

      <FormActions
        onCancel={onCancel}
        submitLabel={initialData ? 'Atualizar' : 'Criar'}
        isLoading={isPending}
      />
    </form>
  )
}
