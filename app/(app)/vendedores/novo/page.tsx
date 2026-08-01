'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PageHeader } from '@/components/ui/page-header'
import { SalespersonForm } from '@/components/salesperson/salesperson-form'
import { createSalesperson } from '@/app/actions/salesperson'
import type { CreateSalespersonInput } from '@/src/types/salesperson'

// TODO: Get from auth context
const companyId = 'test-company-id'

export default function NovoVendedorPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(data: CreateSalespersonInput) {
    try {
      setIsSubmitting(true)
      setError(null)

      const result = await createSalesperson(companyId, data)

      if (result.success) {
        router.push('/vendedores')
      } else {
        setError(result.error || 'Erro ao criar vendedor')
      }
    } catch (err) {
      console.error('Error:', err)
      setError('Erro ao criar vendedor')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <PageHeader
        title="Novo Vendedor"
        description="Adicione um novo vendedor ao sistema"
      />

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          {error}
        </div>
      )}

      <div className="bg-white border border-border rounded-lg p-6">
        <SalespersonForm
          isSubmitting={isSubmitting}
          onSubmit={handleSubmit}
          submitLabel="Criar Vendedor"
        />
      </div>
    </div>
  )
}
