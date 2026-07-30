'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { FormInput } from '@/components/ui/form-input'
import { FormSelect } from '@/components/ui/form-select'
import { FormTextarea } from '@/components/ui/form-textarea'
import type { CRMLead } from '@/src/modules/crm/types'

interface LeadFormProps {
  lead?: CRMLead
  onSubmit: (data: Partial<CRMLead>) => Promise<void>
  isLoading?: boolean
}

const sourceOptions = [
  { value: 'website', label: 'Website' },
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Telefone' },
  { value: 'referral', label: 'Indicação' },
  { value: 'social', label: 'Redes Sociais' },
  { value: 'other', label: 'Outro' }
]

const statusOptions = [
  { value: 'novo', label: 'Novo' },
  { value: 'em_contato', label: 'Em Contato' },
  { value: 'interessado', label: 'Interessado' },
  { value: 'proposta', label: 'Proposta' },
  { value: 'perdido', label: 'Perdido' }
]

export function LeadForm({ lead, onSubmit, isLoading }: LeadFormProps) {
  const [formData, setFormData] = useState<Partial<CRMLead>>({
    name: lead?.name || '',
    email: lead?.email || '',
    phone: lead?.phone || '',
    company: lead?.company || '',
    source: lead?.source || 'website',
    status: lead?.status || 'novo',
    notes: lead?.notes || '',
    value: lead?.value || undefined
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormInput
        label="Nome"
        placeholder="Nome do lead"
        value={formData.name || ''}
        onChange={e => setFormData({ ...formData, name: e.target.value })}
        required
      />

      <FormInput
        label="Email"
        type="email"
        placeholder="email@example.com"
        value={formData.email || ''}
        onChange={e => setFormData({ ...formData, email: e.target.value })}
        required
      />

      <FormInput
        label="Telefone"
        placeholder="(11) 98765-4321"
        value={formData.phone || ''}
        onChange={e => setFormData({ ...formData, phone: e.target.value })}
      />

      <FormInput
        label="Empresa"
        placeholder="Nome da empresa"
        value={formData.company || ''}
        onChange={e => setFormData({ ...formData, company: e.target.value })}
      />

      <FormInput
        label="Valor Estimado"
        type="number"
        placeholder="R$ 0,00"
        value={formData.value || ''}
        onChange={e => setFormData({ ...formData, value: parseFloat(e.target.value) })}
      />

      <FormSelect
        label="Fonte"
        options={sourceOptions}
        value={formData.source || 'website'}
        onChange={value => setFormData({ ...formData, source: value as CRMLead['source'] })}
      />

      <FormSelect
        label="Status"
        options={statusOptions}
        value={formData.status || 'novo'}
        onChange={value => setFormData({ ...formData, status: value as CRMLead['status'] })}
      />

      <FormTextarea
        label="Notas"
        placeholder="Adicione notas sobre o lead..."
        value={formData.notes || ''}
        onChange={e => setFormData({ ...formData, notes: e.target.value })}
        rows={4}
      />

      <div className="flex gap-2 pt-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Salvando...' : 'Salvar Lead'}
        </Button>
      </div>
    </form>
  )
}
