'use client'

import { useState, useTransition } from 'react'
import { orcamentoFormSchema, type OrcamentoFormData } from '@/src/lib/validations/forms'
import { FormField, FormSectionGroup, FormActions } from '@/components/ui/form-field'
import { Input } from '@/components/ui/input'

interface OrcamentoFormProps {
  initialData?: OrcamentoFormData
  onSubmit: (data: OrcamentoFormData) => Promise<{ success?: boolean; error?: string }>
  onCancel?: () => void
}

export function OrcamentoForm({ initialData, onSubmit, onCancel }: OrcamentoFormProps) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState<Partial<OrcamentoFormData>>(initialData || { items: [] })

  const handleChange = (field: keyof OrcamentoFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors(prev => { const { [field]: _, ...rest } = prev; return rest })
  }

  const addItem = () => {
    const items = formData.items || []
    setFormData(prev => ({
      ...prev,
      items: [...items, { description: '', quantity: 1, unitPrice: 0, discount: 0 }]
    }))
  }

  const removeItem = (index: number) => {
    const items = formData.items || []
    setFormData(prev => ({
      ...prev,
      items: items.filter((_, i) => i !== index)
    }))
  }

  const updateItem = (index: number, field: string, value: any) => {
    const items = formData.items || []
    const updated = [...items]
    updated[index] = { ...updated[index], [field]: value }
    setFormData(prev => ({ ...prev, items: updated }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    startTransition(async () => {
      try {
        const validatedData = orcamentoFormSchema.parse(formData)
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

      <FormSectionGroup title="Informações do Orçamento">
        <FormField label="Título" error={errors.title ? { message: errors.title } : undefined} required className="md:col-span-2">
          <Input
            value={formData.title || ''}
            onChange={e => handleChange('title', e.target.value)}
            placeholder="Título do orçamento"
            disabled={isPending}
          />
        </FormField>

        <FormField label="Cliente" error={errors.clientId ? { message: errors.clientId } : undefined} required>
          <Input
            value={formData.clientId || ''}
            onChange={e => handleChange('clientId', e.target.value)}
            placeholder="ID do cliente"
            disabled={isPending}
          />
        </FormField>

        <FormField label="Status" error={errors.status ? { message: errors.status } : undefined} required>
          <select
            value={formData.status || 'DRAFT'}
            onChange={e => handleChange('status', e.target.value)}
            disabled={isPending}
            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50"
          >
            <option value="DRAFT">Rascunho</option>
            <option value="SENT">Enviado</option>
            <option value="ACCEPTED">Aceito</option>
            <option value="REJECTED">Rejeitado</option>
            <option value="EXPIRED">Expirado</option>
          </select>
        </FormField>

        <FormField label="Descrição" className="md:col-span-2">
          <textarea
            value={formData.description || ''}
            onChange={e => handleChange('description', e.target.value)}
            placeholder="Descrição do orçamento..."
            disabled={isPending}
            rows={2}
            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50"
          />
        </FormField>
      </FormSectionGroup>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-foreground">Itens</h3>
          <button
            type="button"
            onClick={addItem}
            disabled={isPending}
            className="text-sm text-accent hover:text-accent/80 font-medium disabled:opacity-50"
          >
            + Adicionar item
          </button>
        </div>

        {(formData.items || []).map((item, index) => (
          <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-2 p-4 border border-border rounded-lg">
            <FormField label="Descrição" className="md:col-span-2">
              <Input
                value={item.description || ''}
                onChange={e => updateItem(index, 'description', e.target.value)}
                placeholder="Descrição do item"
                disabled={isPending}
              />
            </FormField>

            <FormField label="Quantidade">
              <Input
                type="number"
                value={item.quantity || ''}
                onChange={e => updateItem(index, 'quantity', parseFloat(e.target.value))}
                placeholder="1"
                disabled={isPending}
              />
            </FormField>

            <FormField label="Valor Unitário">
              <Input
                type="text"
                value={item.unitPrice || ''}
                onChange={e => updateItem(index, 'unitPrice', parseFloat(e.target.value.replace(/\D/g, '')) / 100)}
                placeholder="0,00"
                disabled={isPending}
              />
            </FormField>

            <FormField label="Desconto %">
              <Input
                type="number"
                value={item.discount || ''}
                onChange={e => updateItem(index, 'discount', Math.min(Math.max(parseFloat(e.target.value) || 0, 0), 100))}
                placeholder="0"
                disabled={isPending}
                min="0"
                max="100"
              />
            </FormField>

            <button
              type="button"
              onClick={() => removeItem(index)}
              disabled={isPending}
              className="text-sm text-destructive hover:text-destructive/80 font-medium disabled:opacity-50 md:col-span-1"
            >
              Remover
            </button>
          </div>
        ))}
      </div>

      <FormSectionGroup title="Resumo">
        <FormField label="Desconto Total (%)" className="md:col-span-2">
          <Input
            type="number"
            value={formData.discount || ''}
            onChange={e => handleChange('discount', Math.min(Math.max(parseFloat(e.target.value) || 0, 0), 100))}
            placeholder="0"
            disabled={isPending}
            min="0"
            max="100"
          />
        </FormField>

        <FormField label="Válido até" error={errors.validUntil ? { message: errors.validUntil } : undefined} required>
          <Input
            type="date"
            value={formData.validUntil ? new Date(formData.validUntil).toISOString().split('T')[0] : ''}
            onChange={e => handleChange('validUntil', e.target.value)}
            disabled={isPending}
          />
        </FormField>
      </FormSectionGroup>

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

      <FormActions
        onCancel={onCancel}
        submitLabel={initialData ? 'Atualizar' : 'Criar'}
        isLoading={isPending}
      />
    </form>
  )
}
