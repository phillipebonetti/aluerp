'use client'

import { useState, useTransition } from 'react'
import { osFormSchema, type OSFormData } from '@/src/lib/validations/forms'
import { FormField, FormSectionGroup, FormActions } from '@/components/ui/form-field'
import { Input } from '@/components/ui/input'

interface OSFormProps {
  initialData?: OSFormData
  onSubmit: (data: OSFormData) => Promise<{ success?: boolean; error?: string }>
  onCancel?: () => void
}

export function OSForm({ initialData, onSubmit, onCancel }: OSFormProps) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState<Partial<OSFormData>>(initialData || {})

  const handleChange = (field: keyof OSFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors(prev => { const { [field]: _, ...rest } = prev; return rest })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    startTransition(async () => {
      try {
        const validatedData = osFormSchema.parse(formData)
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

      <FormSectionGroup title="Informações da OS">
        <FormField label="Número" error={errors.number ? { message: errors.number } : undefined} required>
          <Input
            value={formData.number || ''}
            onChange={e => handleChange('number', e.target.value)}
            placeholder="Número da OS"
            disabled={isPending}
          />
        </FormField>

        <FormField label="Status" error={errors.status ? { message: errors.status } : undefined} required>
          <select
            value={formData.status || 'PENDING'}
            onChange={e => handleChange('status', e.target.value)}
            disabled={isPending}
            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50"
          >
            <option value="PENDING">Pendente</option>
            <option value="IN_PROGRESS">Em Andamento</option>
            <option value="COMPLETED">Concluída</option>
            <option value="CANCELLED">Cancelada</option>
          </select>
        </FormField>

        <FormField label="Cliente" error={errors.clientId ? { message: errors.clientId } : undefined} required className="md:col-span-2">
          <Input
            value={formData.clientId || ''}
            onChange={e => handleChange('clientId', e.target.value)}
            placeholder="ID do cliente"
            disabled={isPending}
          />
        </FormField>

        <FormField label="Descrição" error={errors.description ? { message: errors.description } : undefined} required className="md:col-span-2">
          <textarea
            value={formData.description || ''}
            onChange={e => handleChange('description', e.target.value)}
            placeholder="Descrição da OS..."
            disabled={isPending}
            rows={3}
            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50"
          />
        </FormField>
      </FormSectionGroup>

      <FormSectionGroup title="Planejamento">
        <FormField label="Data Inicial" error={errors.startDate ? { message: errors.startDate } : undefined} required>
          <Input
            type="date"
            value={formData.startDate ? new Date(formData.startDate).toISOString().split('T')[0] : ''}
            onChange={e => handleChange('startDate', e.target.value)}
            disabled={isPending}
          />
        </FormField>

        <FormField label="Data Final">
          <Input
            type="date"
            value={formData.endDate ? new Date(formData.endDate).toISOString().split('T')[0] : ''}
            onChange={e => handleChange('endDate', e.target.value)}
            disabled={isPending}
          />
        </FormField>

        <FormField label="Horas Estimadas">
          <Input
            type="number"
            value={formData.estimatedHours || ''}
            onChange={e => handleChange('estimatedHours', parseFloat(e.target.value))}
            placeholder="0"
            disabled={isPending}
          />
        </FormField>

        <FormField label="Responsável" error={errors.assignedTo ? { message: errors.assignedTo } : undefined} required>
          <Input
            value={formData.assignedTo || ''}
            onChange={e => handleChange('assignedTo', e.target.value)}
            placeholder="ID do responsável"
            disabled={isPending}
          />
        </FormField>

        <FormField label="Prioridade" error={errors.priority ? { message: errors.priority } : undefined} required>
          <select
            value={formData.priority || ''}
            onChange={e => handleChange('priority', e.target.value)}
            disabled={isPending}
            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50"
          >
            <option value="">Selecione...</option>
            <option value="LOW">Baixa</option>
            <option value="MEDIUM">Média</option>
            <option value="HIGH">Alta</option>
            <option value="URGENT">Urgente</option>
          </select>
        </FormField>

        <FormField label="Projeto">
          <Input
            value={formData.projectId || ''}
            onChange={e => handleChange('projectId', e.target.value)}
            placeholder="ID do projeto"
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
