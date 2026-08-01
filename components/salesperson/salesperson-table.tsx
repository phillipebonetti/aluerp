'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/src/lib/utils'
import type { Salesperson } from '@/src/types/salesperson'
import { Edit, Trash2, Eye } from 'lucide-react'

interface SalespersonTableProps {
  data: Salesperson[]
  isLoading?: boolean
  onView?: (id: string) => void
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
  columns?: ('name' | 'email' | 'phone' | 'cpf' | 'commission' | 'status' | 'hireDate' | 'actions')[]
}

const statusColors: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-800',
  INACTIVE: 'bg-gray-100 text-gray-800',
  ON_LEAVE: 'bg-yellow-100 text-yellow-800',
  FIRED: 'bg-red-100 text-red-800',
}

export function SalespersonTable({
  data,
  isLoading = false,
  onView,
  onEdit,
  onDelete,
  columns = ['name', 'email', 'phone', 'commission', 'status', 'actions'],
}: SalespersonTableProps) {
  if (isLoading) {
    return <div className="text-center py-8">Carregando...</div>
  }

  if (!data.length) {
    return <div className="text-center py-8 text-muted-foreground">Nenhum vendedor encontrado</div>
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.includes('name') && <TableHead>Nome</TableHead>}
            {columns.includes('email') && <TableHead>E-mail</TableHead>}
            {columns.includes('phone') && <TableHead>Telefone</TableHead>}
            {columns.includes('cpf') && <TableHead>CPF</TableHead>}
            {columns.includes('commission') && <TableHead>Comissão</TableHead>}
            {columns.includes('status') && <TableHead>Status</TableHead>}
            {columns.includes('hireDate') && <TableHead>Data de Admissão</TableHead>}
            {columns.includes('actions') && <TableHead className="text-right">Ações</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((salesperson) => (
            <TableRow key={salesperson.id}>
              {columns.includes('name') && <TableCell>{salesperson.name}</TableCell>}
              {columns.includes('email') && <TableCell>{salesperson.email || '-'}</TableCell>}
              {columns.includes('phone') && <TableCell>{salesperson.phone || '-'}</TableCell>}
              {columns.includes('cpf') && <TableCell>{salesperson.cpf || '-'}</TableCell>}
              {columns.includes('commission') && (
                <TableCell>{Number(salesperson.commissionRate).toFixed(2)}%</TableCell>
              )}
              {columns.includes('status') && (
                <TableCell>
                  <Badge className={statusColors[salesperson.status]}>
                    {salesperson.status === 'ACTIVE' && 'Ativo'}
                    {salesperson.status === 'INACTIVE' && 'Inativo'}
                    {salesperson.status === 'ON_LEAVE' && 'Licença'}
                    {salesperson.status === 'FIRED' && 'Demitido'}
                  </Badge>
                </TableCell>
              )}
              {columns.includes('hireDate') && (
                <TableCell>{salesperson.hireDate ? formatDate(new Date(salesperson.hireDate)) : '-'}</TableCell>
              )}
              {columns.includes('actions') && (
                <TableCell className="text-right space-x-2">
                  {onView && (
                    <Button variant="ghost" size="sm" onClick={() => onView(salesperson.id)}>
                      <Eye className="w-4 h-4" />
                    </Button>
                  )}
                  {onEdit && (
                    <Button variant="ghost" size="sm" onClick={() => onEdit(salesperson.id)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                  )}
                  {onDelete && (
                    <Button variant="ghost" size="sm" onClick={() => onDelete(salesperson.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
