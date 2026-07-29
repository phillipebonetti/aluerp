'use client'

import { useState, useTransition } from 'react'
import { configuracoesFormSchema, type ConfiguracoesFormData } from '@/src/lib/validations/forms'
import { masks } from '@/src/lib/validations/masks'
import { FormField, FormSectionGroup, FormActions } from '@/components/ui/form-field'
import { Input } from '@/components/ui/input'

interface ConfiguracoesFormProps {
  initialData?: ConfiguracoesFormData
  onSubmit: (data: ConfiguracoesFormData) => Promise<{ success?: boolean; error?: string }>
  onCancel?: () => void
}

export function ConfiguracoesForm({ initialData, onSubmit, onCancel }: ConfiguracoesFormProps) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState<Partial<ConfiguracoesFormData>>(initialData || {})

  const handleChange = (field: keyof ConfiguracoesFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors(prev => { const { [field]: _, ...rest } = prev; return rest })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    startTransition(async () => {
      try {
        const validatedData = configuracoesFormSchema.parse(formData)
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

      <FormSectionGroup title="Informações da Empresa">
        <FormField label="Nome da Empresa" error={errors.companyName ? { message: errors.companyName } : undefined} required className="md:col-span-2">
          <Input
            value={formData.companyName || ''}
            onChange={e => handleChange('companyName', e.target.value)}
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
            onChange={e => handleChange('phone', masks.phone(e.target.value))}
            placeholder="(11) 98765-4321"
            disabled={isPending}
          />
        </FormField>

        <FormField label="CNPJ">
          <Input
            value={formData.cnpj || ''}
            onChange={e => handleChange('cnpj', masks.cnpj(e.target.value))}
            placeholder="12.345.678/0001-90"
            disabled={isPending}
          />
        </FormField>

        <FormField label="Logo">
          <Input
            type="file"
            accept="image/*"
            onChange={e => handleChange('logo', e.target.files?.[0])}
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
            onChange={e => handleChange('zipCode', masks.cep(e.target.value))}
            placeholder="12345-678"
            disabled={isPending}
          />
        </FormField>
      </FormSectionGroup>

      <FormSectionGroup title="Localização e Formato">
        <FormField label="Timezone" required>
          <select
            value={formData.timezone || 'America/Sao_Paulo'}
            onChange={e => handleChange('timezone', e.target.value)}
            disabled={isPending}
            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50"
          >
            <option value="America/Sao_Paulo">São Paulo (UTC-3)</option>
            <option value="America/Manaus">Manaus (UTC-4)</option>
            <option value="America/Maceio">Maceió (UTC-3)</option>
          </select>
        </FormField>

        <FormField label="Formato de Data" required>
          <select
            value={formData.dateFormat || 'DD/MM/YYYY'}
            onChange={e => handleChange('dateFormat', e.target.value)}
            disabled={isPending}
            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50"
          >
            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
          </select>
        </FormField>

        <FormField label="Símbolo de Moeda" required>
          <Input
            value={formData.currencySymbol || 'R$'}
            onChange={e => handleChange('currencySymbol', e.target.value)}
            disabled={isPending}
          />
        </FormField>
      </FormSectionGroup>

      <FormActions
        onCancel={onCancel}
        submitLabel="Salvar Configurações"
        isLoading={isPending}
      />
    </form>
  )
}
