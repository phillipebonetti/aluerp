'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { PageHeader } from '@/components/ui/page-header'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  DollarSign,
  Calendar,
  User,
  FileText,
  AlertCircle,
  CheckCircle,
  Clock,
  Trash2,
  Download,
  ArrowLeft,
} from 'lucide-react'
import Link from 'next/link'

const companyId = 'test-company-id'

export default function ReceivableDetailsPage() {
  const params = useParams()
  const id = params?.id as string
  const [receivable, setReceivable] = useState<any>(null)
  const [installments, setInstallments] = useState<any[]>([])
  const [history, setHistory] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!id) return

    // Mock data
    setReceivable({
      id,
      documentNumber: 'REC-123456',
      client: { name: 'Cliente Exemplo', email: 'cliente@email.com' },
      quote: { number: 'ORC-001', status: 'APROVADO' },
      serviceOrder: { number: 'OS-2024-001', status: 'CONCLUÍDA' },
      totalValue: 12000,
      receivedValue: 4000,
      status: 'PARCIALMENTE_RECEBIDO',
      issueDate: '2024-01-15',
      dueDate: '2024-02-15',
      vendedor: { name: 'João Silva' },
      commission: 960,
      notes: 'Pagamento conforme acordo',
    })

    setInstallments([
      {
        id: '1',
        number: 1,
        value: 4000,
        receivedValue: 4000,
        dueDate: '2024-02-15',
        status: 'RECEBIDO',
        paymentMethod: 'PIX',
        receivedDate: '2024-02-10',
      },
      {
        id: '2',
        number: 2,
        value: 4000,
        receivedValue: 0,
        dueDate: '2024-03-15',
        status: 'ABERTO',
        paymentMethod: null,
      },
      {
        id: '3',
        number: 3,
        value: 4000,
        receivedValue: 0,
        dueDate: '2024-04-15',
        status: 'ABERTO',
        paymentMethod: null,
      },
    ])

    setHistory([
      {
        id: '1',
        eventType: 'CREATED',
        description: 'Conta criada de orçamento ORC-001',
        date: '2024-01-15',
        user: 'Sistema',
      },
      {
        id: '2',
        eventType: 'PAYMENT_RECEIVED',
        description: 'Recebimento de R$ 4.000 via PIX',
        date: '2024-02-10',
        user: 'Maria Santos',
      },
    ])

    setIsLoading(false)
  }, [id])

  if (isLoading || !receivable) {
    return <div className="p-6 text-center">Carregando detalhes...</div>
  }

  const statusColors: Record<string, string> = {
    ABERTO: 'bg-yellow-100 text-yellow-800',
    RECEBIDO: 'bg-green-100 text-green-800',
    PARCIALMENTE_RECEBIDO: 'bg-blue-100 text-blue-800',
    VENCIDO: 'bg-red-100 text-red-800',
    CANCELADO: 'bg-gray-100 text-gray-800',
  }

  return (
    <div className="p-6 max-w-screen-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/financeiro/contas-a-receber">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </Link>
        <PageHeader
          title={`Conta ${receivable.documentNumber}`}
          description={`Cliente: ${receivable.client.name}`}
        />
      </div>

      {/* Header Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="p-4">
          <p className="text-sm text-gray-600">Valor Total</p>
          <p className="text-2xl font-bold mt-2 text-blue-600">R$ {receivable.totalValue.toLocaleString('pt-BR')}</p>
        </Card>

        <Card className="p-4">
          <p className="text-sm text-gray-600">Recebido</p>
          <p className="text-2xl font-bold mt-2 text-green-600">R$ {receivable.receivedValue.toLocaleString('pt-BR')}</p>
        </Card>

        <Card className="p-4">
          <p className="text-sm text-gray-600">Saldo</p>
          <p className="text-2xl font-bold mt-2 text-orange-600">
            R$ {(receivable.totalValue - receivable.receivedValue).toLocaleString('pt-BR')}
          </p>
        </Card>

        <Card className="p-4">
          <p className="text-sm text-gray-600">Comissão</p>
          <p className="text-2xl font-bold mt-2 text-purple-600">R$ {receivable.commission.toLocaleString('pt-BR')}</p>
        </Card>

        <Card className="p-4">
          <p className="text-sm text-gray-600">Status</p>
          <Badge className={`mt-2 ${statusColors[receivable.status]}`}>{receivable.status}</Badge>
        </Card>
      </div>

      {/* Details */}
      <Tabs defaultValue="installments" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="installments">Parcelas</TabsTrigger>
          <TabsTrigger value="details">Detalhes</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
        </TabsList>

        {/* Installments Tab */}
        <TabsContent value="installments" className="mt-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Parcelas</h3>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Parcela</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Recebido</TableHead>
                    <TableHead>Saldo</TableHead>
                    <TableHead>Vencimento</TableHead>
                    <TableHead>Forma de Pagamento</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {installments.map((installment) => (
                    <TableRow key={installment.id}>
                      <TableCell className="font-medium">#{installment.number}</TableCell>
                      <TableCell>R$ {installment.value.toLocaleString('pt-BR')}</TableCell>
                      <TableCell>R$ {installment.receivedValue.toLocaleString('pt-BR')}</TableCell>
                      <TableCell>R$ {(installment.value - installment.receivedValue).toLocaleString('pt-BR')}</TableCell>
                      <TableCell>{installment.dueDate}</TableCell>
                      <TableCell>{installment.paymentMethod || '-'}</TableCell>
                      <TableCell>
                        <Badge className={`${statusColors[installment.status]}`}>{installment.status}</Badge>
                      </TableCell>
                      <TableCell>
                        {installment.status === 'ABERTO' && (
                          <Button variant="ghost" size="sm">
                            Registrar Pagamento
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>

        {/* Details Tab */}
        <TabsContent value="details" className="mt-4">
          <Card className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Cliente
                </h4>
                <p className="text-sm">{receivable.client.name}</p>
                <p className="text-sm text-gray-600">{receivable.client.email}</p>
              </div>

              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Orçamento
                </h4>
                <p className="text-sm">{receivable.quote.number}</p>
                <Badge className="mt-1">{receivable.quote.status}</Badge>
              </div>

              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Datas
                </h4>
                <p className="text-sm">Emissão: {receivable.issueDate}</p>
                <p className="text-sm">Vencimento: {receivable.dueDate}</p>
              </div>

              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Comissão
                </h4>
                <p className="text-sm">Vendedor: {receivable.vendedor.name}</p>
                <p className="text-sm">Valor: R$ {receivable.commission.toLocaleString('pt-BR')}</p>
              </div>
            </div>

            {receivable.notes && (
              <div className="pt-4 border-t">
                <h4 className="font-semibold mb-2">Observações</h4>
                <p className="text-sm text-gray-700">{receivable.notes}</p>
              </div>
            )}
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="mt-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Histórico</h3>
            <div className="space-y-4">
              {history.map((entry) => (
                <div key={entry.id} className="flex items-start gap-3 pb-4 border-b last:border-b-0">
                  {entry.eventType === 'CREATED' && <FileText className="h-5 w-5 text-blue-600 mt-0.5" />}
                  {entry.eventType === 'PAYMENT_RECEIVED' && <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />}
                  <div className="flex-1">
                    <p className="text-sm font-medium">{entry.description}</p>
                    <p className="text-xs text-gray-500">
                      {entry.date} por {entry.user}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="flex gap-2 justify-between">
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
        {receivable.status !== 'RECEBIDO' && receivable.status !== 'CANCELADO' && (
          <div className="flex gap-2">
            <Button variant="destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
