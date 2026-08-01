'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { PageHeader } from '@/components/ui/page-header'
import { OSForm } from '@/components/os/os-form'
import { prisma } from '@/lib/prisma'

// TODO: Get from auth context
const companyId = 'test-company-id'
const projectId = 'test-project-id'

export default function NovoOSPage() {
  const router = useRouter()
  const [clients, setClients] = useState<any[]>([])
  const [vendors, setVendors] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // TODO: Load clients and vendors from database
  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true)
        // Placeholder - will be replaced with actual data fetching
        setClients([
          { id: '1', name: 'Cliente 1' },
          { id: '2', name: 'Cliente 2' },
        ])
        setVendors([
          { id: '1', name: 'Vendedor 1' },
          { id: '2', name: 'Vendedor 2' },
        ])
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  if (isLoading) {
    return <div className="p-6">Carregando...</div>
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <PageHeader title="Criar Nova Ordem de Serviço" description="Preencha os dados abaixo para criar uma nova OS." />

      <div className="bg-card border border-border rounded-lg p-6">
        <OSForm
          companyId={companyId}
          projectId={projectId}
          clientId=""
          clients={clients}
          vendors={vendors}
          onSuccess={(osId) => {
            router.push(`/os/${osId}`)
          }}
        />
      </div>
    </div>
  )
}
