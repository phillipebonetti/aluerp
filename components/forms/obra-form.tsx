'use client'

import { useState, useTransition } from 'react'
import { obraFormSchema, type ObraFormData } from '@/src/lib/validations/forms'
import { masks } from '@/src/lib/validations/masks'
import { FormField, FormSectionGroup, FormActions } from '@/components/ui/form-field'
import { Input } from '@/components/ui/input'

interface ObraFormProps {
  initialData?: ObraFormData
  onSubmit: (data: ObraFormData) => Promise<{ success?: boolean; error?: string }>
  onCancel?: () => void
}

export function ObraForm({ initialData, onSubmit, onCancel }: ObraFormProps) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState<Partial<ObraFormData>>(initialData || {})

  const handleChange = (field: keyof ObraFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => { const { [field]: _, ...rest } = prev; return rest })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setErrors({})

    startTransition(async () => {
      try {
        const validatedData = obraFormSchema.parse(formData)
        const result = await onSubmit(validatedData)
        if (result.error) setError(result.error)
      } catch (err: any) {
        if (err.errors) {
          const fieldErrors: Record<string, string> = {}
          err.errors.forEach((e: any) => {
            fieldErrors[e.path[0]] = e.message
          })
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

      <FormSectionGroup title="Informações da Obra">
        <FormField label="Nome" error={errors.name ? { message: errors.name } : undefined} required className="md:col-span-2">
          <Input
            value={formData.name || ''}
            onChange={e => handleChange('name', e.target.value)}
            placeholder="Nome da obra"
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
            value={formData.status || ''}
            onChange={e => handleChange('status', e.target.value)}
            disabled={isPending}
            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50"
          >
            <option value="">Selecione...</option>
            <option value="PLANNING">Planejamento</option>
            <option value="IN_PROGRESS">Em Andamento</option>
            <option value="COMPLETED">Concluída</option>
            <option value="SUSPENDED">Suspensa</option>
            <option value="CANCELLED">Cancelada</option>
          </select>
        </FormField>

        <FormField label="Descrição" className="md:col-span-2">
          <textarea
            value={formData.description || ''}
            onChange={e => handleChange('description', e.target.value)}
            placeholder="Descrição da obra..."
            disabled={isPending}
            rows={3}
            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50"
          />
        </FormField>
      </FormSectionGroup>

      <FormSectionGroup title="Localização">
        <FormField label="Rua" error={errors.address ? { message: errors.address } : undefined} required className="md:col-span-2">
          <Input
            value={formData.address || ''}
            onChange={e => handleChange('address', e.target.value)}
            disabled={isPending}
          />
        </FormField>

        <FormField label="Número" error={errors.number ? { message: errors.number } : undefined} required>
          <Input
            value={formData.number || ''}
            onChange={e => handleChange('number', e.target.value)}
            disabled={isPending}
          />
        </FormField>

        <FormField label="Complemento">
          <Input
            value={formData.complement || ''}
            onChange={e => handleChange('complement', e.target.value)}
            disabled={isPending}
          />
        </FormField>

        <FormField label="Bairro" error={errors.neighborhood ? { message: errors.neighborhood } : undefined} required>
          <Input
            value={formData.neighborhood || ''}
            onChange={e => handleChange('neighborhood', e.target.value)}
            disabled={isPending}
          />
        </FormField>

        <FormField label="Cidade" error={errors.city ? { message: errors.city } : undefined} required>
          <Input
            value={formData.city || ''}
            onChange={e => handleChange('city', e.target.value)}
            disabled={isPending}
          />
        </FormField>

        <FormField label="UF" error={errors.state ? { message: errors.state } : undefined} required>
          <Input
            value={formData.state || ''}
            onChange={e => handleChange('state', e.target.value.toUpperCase())}
            maxLength={2}
            disabled={isPending}
          />
        </FormField>

        <FormField label="CEP" error={errors.zipCode ? { message: errors.zipCode } : undefined} required>
          <Input
            value={formData.zipCode || ''}
            onChange={e => handleChange('zipCode', e.target.value.replace(/\D/g, '').replace(/(\d{5})(\d)/, '$1-$2'))}
            placeholder="12345-678"
            disabled={isPending}
          />
        </FormField>
      </FormSectionGroup>

      <FormSectionGroup title="Datas e Orçamento">
        <FormField label="Data Inicial" error={errors.startDate ? { message: errors.startDate } : undefined} required>
          <Input
            type="date"
            value={formData.startDate ? new Date(formData.startDate).toISOString().split('T')[0] : ''}
            onChange={e => handleChange('startDate', e.target.value)}
            disabled={isPending}
          />
        </FormField>

        <FormField label="Data Final" error={errors.endDate ? { message: errors.endDate } : undefined} required>
          <Input
            type="date"
            value={formData.endDate ? new Date(formData.endDate).toISOString().split('T')[0] : ''}
            onChange={e => handleChange('endDate', e.target.value)}
            disabled={isPending}
          />
        </FormField>

        <FormField label="Orçamento" error={errors.budget ? { message: errors.budget } : undefined} required className="md:col-span-2">
          <Input
            type="text"
            value={formData.budget || ''}
            onChange={e => handleChange('budget', e.target.value.replace(/\D/g, ''))}
            placeholder="0,00"
            disabled={isPending}
          />
        </FormField>
      </FormSectionGroup>

      <FormField label="Observações">
        <textarea
          value={formData.notes || ''}
          onChange={e => handleChange('notes', e.target.value)}
          placeholder="Observações sobre a obra..."
          disabled={isPending}
          rows={3}
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
