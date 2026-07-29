'use client'

import { useState, useTransition } from 'react'
import { fornecedorFormSchema, type FornecedorFormData } from '@/src/lib/validations/forms'
import { masks } from '@/src/lib/validations/masks'
import { FormField, FormSectionGroup, FormActions } from '@/components/ui/form-field'
import { Input } from '@/components/ui/input'

interface FornecedorFormProps {
  initialData?: FornecedorFormData
  onSubmit: (data: FornecedorFormData) => Promise<{ success?: boolean; error?: string }>
  onCancel?: () => void
}

export function FornecedorForm({ initialData, onSubmit, onCancel }: FornecedorFormProps) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState<Partial<FornecedorFormData>>(initialData || {})

  const handleChange = (field: keyof FornecedorFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => { const { [field]: _, ...rest } = prev; return rest })
    }
  }

  const handleApplyMask = (field: keyof FornecedorFormData, value: string, maskFn: (v: string) => string) => {
    const masked = maskFn(value)
    handleChange(field, masked)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setErrors({})

    startTransition(async () => {
      try {
        const validatedData = fornecedorFormSchema.parse(formData)
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

      <FormSectionGroup title="Informações Básicas">
        <FormField label="Nome" error={errors.name ? { message: errors.name } : undefined} required>
          <Input
            value={formData.name || ''}
            onChange={e => handleChange('name', e.target.value)}
            placeholder="Nome da empresa"
            disabled={isPending}
          />
        </FormField>

        <FormField label="Email" error={errors.email ? { message: errors.email } : undefined} required>
          <Input
            type="email"
            value={formData.email || ''}
            onChange={e => handleChange('email', e.target.value)}
            disabled={isPending}
          />
        </FormField>

        <FormField label="Telefone" error={errors.phone ? { message: errors.phone } : undefined} required>
          <Input
            value={formData.phone || ''}
            onChange={e => handleApplyMask('phone', e.target.value, masks.phone)}
            placeholder="(11) 98765-4321"
            disabled={isPending}
          />
        </FormField>

        <FormField label="CNPJ" error={errors.cnpj ? { message: errors.cnpj } : undefined} required>
          <Input
            value={formData.cnpj || ''}
            onChange={e => handleApplyMask('cnpj', e.target.value, masks.cnpj)}
            placeholder="12.345.678/0001-90"
            disabled={isPending}
          />
        </FormField>
      </FormSectionGroup>

      <FormSectionGroup title="Endereço">
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
            onChange={e => handleApplyMask('zipCode', e.target.value, masks.cep)}
            placeholder="12345-678"
            disabled={isPending}
          />
        </FormField>
      </FormSectionGroup>

      <FormSectionGroup title="Dados Bancários">
        <FormField label="Conta Bancária" className="md:col-span-2">
          <Input
            value={formData.bankAccount || ''}
            onChange={e => handleChange('bankAccount', e.target.value)}
            placeholder="0000000-0"
            disabled={isPending}
          />
        </FormField>

        <FormField label="Prazo de Pagamento" className="md:col-span-2">
          <Input
            value={formData.paymentTerms || ''}
            onChange={e => handleChange('paymentTerms', e.target.value)}
            placeholder="Ex: 30 dias"
            disabled={isPending}
          />
        </FormField>
      </FormSectionGroup>

      <FormField label="Observações">
        <textarea
          value={formData.notes || ''}
          onChange={e => handleChange('notes', e.target.value)}
          placeholder="Adicione observações..."
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
