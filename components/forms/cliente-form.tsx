'use client'

import { useState, useTransition } from 'react'
import { clienteFormSchema, type ClienteFormData } from '@/src/lib/validations/forms'
import { masks, formatters } from '@/src/lib/validations/masks'
import { FormField, FormSectionGroup, FormActions } from '@/components/ui/form-field'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface ClienteFormProps {
  initialData?: ClienteFormData
  onSubmit: (data: ClienteFormData) => Promise<{ success?: boolean; error?: string }>
  onCancel?: () => void
  isLoading?: boolean
}

export function ClienteForm({ initialData, onSubmit, onCancel, isLoading: externalLoading }: ClienteFormProps) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState<Partial<ClienteFormData>>({
    name: initialData?.name || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    cpf: initialData?.cpf || '',
    cnpj: initialData?.cnpj || '',
    address: initialData?.address || '',
    number: initialData?.number || '',
    complement: initialData?.complement || '',
    neighborhood: initialData?.neighborhood || '',
    city: initialData?.city || '',
    state: initialData?.state || '',
    zipCode: initialData?.zipCode || '',
    notes: initialData?.notes || '',
    status: initialData?.status || 'ACTIVE',
  })

  const isLoading = isPending || externalLoading

  const handleChange = (field: keyof ClienteFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Limpar erro do campo quando usuário começa a editar
    if (errors[field]) {
      setErrors(prev => { const { [field]: _, ...rest } = prev; return rest })
    }
  }

  const handleApplyMask = (field: keyof ClienteFormData, value: string, maskFn: (v: string) => string) => {
    const masked = maskFn(value)
    handleChange(field, masked)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setErrors({})

    startTransition(async () => {
      try {
        const validatedData = clienteFormSchema.parse(formData)
        const result = await onSubmit(validatedData)

        if (result.error) {
          setError(result.error)
        } else if (result.success) {
          setFormData({
            name: '',
            email: '',
            phone: '',
            cpf: '',
            cnpj: '',
            address: '',
            number: '',
            complement: '',
            neighborhood: '',
            city: '',
            state: '',
            zipCode: '',
            notes: '',
            status: 'ACTIVE',
          })
        }
      } catch (err: any) {
        if (err.errors) {
          const fieldErrors: Record<string, string> = {}
          err.errors.forEach((e: any) => {
            const field = e.path[0]
            fieldErrors[field] = e.message
          })
          setErrors(fieldErrors)
        } else {
          setError(err.message || 'Erro ao processar formulário')
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

      {/* Informações Básicas */}
      <FormSectionGroup title="Informações Básicas" description="Dados principais do cliente">
        <FormField label="Nome" error={errors.name ? { message: errors.name } : undefined} required>
          <Input
            value={formData.name || ''}
            onChange={e => handleChange('name', e.target.value)}
            placeholder="Nome completo"
            disabled={isLoading}
          />
        </FormField>

        <FormField label="Email" error={errors.email ? { message: errors.email } : undefined} required>
          <Input
            type="email"
            value={formData.email || ''}
            onChange={e => handleChange('email', e.target.value)}
            placeholder="email@example.com"
            disabled={isLoading}
          />
        </FormField>

        <FormField label="Telefone" error={errors.phone ? { message: errors.phone } : undefined} required>
          <Input
            value={formData.phone || ''}
            onChange={e => handleApplyMask('phone', e.target.value, masks.phone)}
            placeholder="(11) 98765-4321"
            disabled={isLoading}
          />
        </FormField>

        <FormField label="CPF" error={errors.cpf ? { message: errors.cpf } : undefined}>
          <Input
            value={formData.cpf || ''}
            onChange={e => handleApplyMask('cpf', e.target.value, masks.cpf)}
            placeholder="123.456.789-00"
            disabled={isLoading}
          />
        </FormField>

        <FormField label="CNPJ" error={errors.cnpj ? { message: errors.cnpj } : undefined}>
          <Input
            value={formData.cnpj || ''}
            onChange={e => handleApplyMask('cnpj', e.target.value, masks.cnpj)}
            placeholder="12.345.678/0001-90"
            disabled={isLoading}
          />
        </FormField>
      </FormSectionGroup>

      {/* Endereço */}
      <FormSectionGroup title="Endereço" description="Local do cliente">
        <FormField label="Rua" error={errors.address ? { message: errors.address } : undefined} required className="md:col-span-2">
          <Input
            value={formData.address || ''}
            onChange={e => handleChange('address', e.target.value)}
            placeholder="Rua/Avenida"
            disabled={isLoading}
          />
        </FormField>

        <FormField label="Número" error={errors.number ? { message: errors.number } : undefined} required>
          <Input
            value={formData.number || ''}
            onChange={e => handleChange('number', e.target.value)}
            placeholder="123"
            disabled={isLoading}
          />
        </FormField>

        <FormField label="Complemento" error={errors.complement ? { message: errors.complement } : undefined}>
          <Input
            value={formData.complement || ''}
            onChange={e => handleChange('complement', e.target.value)}
            placeholder="Apto 456"
            disabled={isLoading}
          />
        </FormField>

        <FormField label="Bairro" error={errors.neighborhood ? { message: errors.neighborhood } : undefined} required>
          <Input
            value={formData.neighborhood || ''}
            onChange={e => handleChange('neighborhood', e.target.value)}
            placeholder="Centro"
            disabled={isLoading}
          />
        </FormField>

        <FormField label="Cidade" error={errors.city ? { message: errors.city } : undefined} required>
          <Input
            value={formData.city || ''}
            onChange={e => handleChange('city', e.target.value)}
            placeholder="São Paulo"
            disabled={isLoading}
          />
        </FormField>

        <FormField label="UF" error={errors.state ? { message: errors.state } : undefined} required>
          <Input
            value={formData.state || ''}
            onChange={e => handleChange('state', e.target.value.toUpperCase())}
            placeholder="SP"
            maxLength={2}
            disabled={isLoading}
          />
        </FormField>

        <FormField label="CEP" error={errors.zipCode ? { message: errors.zipCode } : undefined} required>
          <Input
            value={formData.zipCode || ''}
            onChange={e => handleApplyMask('zipCode', e.target.value, masks.cep)}
            placeholder="12345-678"
            disabled={isLoading}
          />
        </FormField>
      </FormSectionGroup>

      {/* Observações */}
      <FormField label="Observações" error={errors.notes ? { message: errors.notes } : undefined}>
        <textarea
          value={formData.notes || ''}
          onChange={e => handleChange('notes', e.target.value)}
          placeholder="Adicione observações sobre o cliente..."
          disabled={isLoading}
          rows={3}
          className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50"
        />
      </FormField>

      {/* Status */}
      <FormField label="Status" error={errors.status ? { message: errors.status } : undefined}>
        <select
          value={formData.status || 'ACTIVE'}
          onChange={e => handleChange('status', e.target.value as any)}
          disabled={isLoading}
          className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50"
        >
          <option value="ACTIVE">Ativo</option>
          <option value="INACTIVE">Inativo</option>
          <option value="ARCHIVED">Arquivado</option>
        </select>
      </FormField>

      <FormActions
        onCancel={onCancel}
        submitLabel={initialData ? 'Atualizar' : 'Criar'}
        isLoading={isLoading}
      />
    </form>
  )
}
