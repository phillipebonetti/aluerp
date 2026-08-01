'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { PageHeader } from '@/components/ui/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { SalespersonTable } from '@/components/salesperson/salesperson-table'
import { listSalespeople, deactivateSalesperson } from '@/app/actions/salesperson'
import { Search, Plus } from 'lucide-react'
import type { Salesperson } from '@/src/types/salesperson'

// TODO: Get from auth context
const companyId = 'test-company-id'

export default function VendedoresPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [data, setData] = useState<Salesperson[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [skip, setSkip] = useState(0)
  const take = 10

  async function loadData() {
    try {
      setIsLoading(true)
      const result = await listSalespeople(companyId, {
        searchTerm: searchTerm || undefined,
        status: (statusFilter as any) || undefined,
        skip,
        take,
      })
      if (result.success) {
        setData(result.data)
        setTotal(result.total)
      }
    } catch (error) {
      console.error('Error loading salespeople:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [skip])

  function handleSearch() {
    setSkip(0)
    setPage(1)
    loadData()
  }

  function handleStatusChange(value: string) {
    setStatusFilter(value)
    setSkip(0)
    setPage(1)
  }

  async function handleDelete(id: string) {
    if (confirm('Tem certeza que deseja desativar este vendedor?')) {
      try {
        await deactivateSalesperson(id)
        loadData()
      } catch (error) {
        console.error('Error deleting:', error)
      }
    }
  }

  return (
    <div className="p-6 max-w-screen-2xl mx-auto space-y-6">
      <PageHeader
        title="Vendedores"
        description="Gerencie vendedores, metas e comissões"
        action={{ label: 'Novo Vendedor', href: '/vendedores/novo' }}
      />

      <div className="space-y-4">
        <div className="flex gap-2 flex-wrap">
          <div className="flex-1 min-w-64 flex gap-2">
            <Input
              placeholder="Buscar por nome, e-mail ou CPF..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button onClick={handleSearch} variant="outline" size="icon">
              <Search className="w-4 h-4" />
            </Button>
          </div>

          <Select value={statusFilter} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos os status</SelectItem>
              <SelectItem value="ACTIVE">Ativo</SelectItem>
              <SelectItem value="INACTIVE">Inativo</SelectItem>
              <SelectItem value="ON_LEAVE">Licença</SelectItem>
              <SelectItem value="FIRED">Demitido</SelectItem>
            </SelectContent>
          </Select>

          <Link href="/vendedores/novo">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Novo Vendedor
            </Button>
          </Link>
        </div>

        <SalespersonTable
          data={data}
          isLoading={isLoading}
          onView={(id) => router.push(`/vendedores/${id}`)}
          onEdit={(id) => router.push(`/vendedores/${id}/editar`)}
          onDelete={handleDelete}
        />

        {total > take && (
          <div className="flex justify-between items-center mt-4">
            <p className="text-sm text-muted-foreground">
              Mostrando {skip + 1} a {Math.min(skip + take, total)} de {total}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                disabled={skip === 0}
                onClick={() => {
                  setSkip(Math.max(0, skip - take))
                  setPage(Math.max(1, page - 1))
                }}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                disabled={skip + take >= total}
                onClick={() => {
                  setSkip(skip + take)
                  setPage(page + 1)
                }}
              >
                Próxima
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
