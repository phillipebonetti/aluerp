'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getClientSessionAction, getClientPaymentsAction } from '@/src/actions/portal'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { 
  DollarSign, 
  TrendingUp,
  AlertCircle,
  Check,
  Download,
  QrCode
} from 'lucide-react'

export default function ClientFinanceiroPage() {
  const router = useRouter()
  const [payments, setPayments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const sessionData = await getClientSessionAction()
        if (!sessionData) {
          router.push('/portal/auth/login')
          return
        }

        const result = await getClientPaymentsAction()
        if (result.success && result.data) {
          setPayments(result.data)
        }
      } catch (error) {
        console.error('[v0] Error loading payments:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <Skeleton className="h-12 w-48" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    )
  }

  const totalContracted = payments.reduce((sum, p) => sum + (p.amount || 0), 0)
  const totalPaid = payments
    .filter(p => p.status === 'PAID')
    .reduce((sum, p) => sum + p.amount, 0)
  const totalPending = totalContracted - totalPaid

  const pendingPayments = payments.filter(p => p.status === 'PENDING' || p.status === 'OVERDUE')
  const paidPayments = payments.filter(p => p.status === 'PAID')

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
          <div className="flex items-center gap-3 mb-4">
            <DollarSign className="w-6 h-6 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Financeiro</h1>
          </div>
          <p className="text-gray-600">
            Acompanhe seus pagamentos e consulte boletos e PIX
          </p>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Contratado</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    R$ {(totalContracted / 1000).toFixed(1)}k
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-600">Já Pago</p>
                  <p className="text-3xl font-bold text-green-600 mt-2">
                    R$ {(totalPaid / 1000).toFixed(1)}k
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {((totalPaid / totalContracted) * 100).toFixed(0)}% do total
                  </p>
                </div>
                <Check className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pendente</p>
                  <p className="text-3xl font-bold text-red-600 mt-2">
                    R$ {(totalPending / 1000).toFixed(1)}k
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {((totalPending / totalContracted) * 100).toFixed(0)}% do total
                  </p>
                </div>
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payments Tabs */}
        <Tabs defaultValue="pendentes" className="space-y-4">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="pendentes">
              Pendentes ({pendingPayments.length})
            </TabsTrigger>
            <TabsTrigger value="pagos">
              Pagos ({paidPayments.length})
            </TabsTrigger>
          </TabsList>

          {/* Pending Payments */}
          <TabsContent value="pendentes" className="space-y-4">
            {pendingPayments.length === 0 ? (
              <Card>
                <CardContent className="pt-12 pb-12">
                  <div className="text-center">
                    <Check className="w-12 h-12 text-green-600 mx-auto mb-4" />
                    <p className="text-gray-600 font-medium">Nenhuma parcela pendente</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              pendingPayments.map(payment => (
                <Card key={payment.id} className={payment.status === 'OVERDUE' ? 'border-red-200 bg-red-50' : ''}>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            {payment.workName}
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">
                            Parcela {payment.installmentNumber} de {payment.totalInstallments}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-gray-900">
                            R$ {(payment.amount / 1000).toFixed(1)}k
                          </p>
                          <span className={`inline-block px-3 py-1 text-xs font-semibold rounded mt-2 ${
                            payment.status === 'OVERDUE'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {payment.status === 'OVERDUE' ? 'ATRASADA' : 'PENDENTE'}
                          </span>
                        </div>
                      </div>

                      <div className="border-t border-gray-200 pt-4">
                        <p className="text-sm text-gray-600">
                          Vencimento: <span className="font-semibold text-gray-900">
                            {new Date(payment.dueDate).toLocaleDateString('pt-BR')}
                          </span>
                        </p>
                      </div>

                      <div className="bg-white rounded-lg p-4 space-y-3">
                        <h5 className="font-semibold text-gray-900">Forma de Pagamento</h5>
                        <div className="grid grid-cols-2 gap-3">
                          <Button variant="outline" size="sm" className="gap-2">
                            <QrCode className="w-4 h-4" />
                            PIX
                          </Button>
                          <Button variant="outline" size="sm" className="gap-2">
                            <Download className="w-4 h-4" />
                            Boleto
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Paid Payments */}
          <TabsContent value="pagos" className="space-y-4">
            {paidPayments.length === 0 ? (
              <Card>
                <CardContent className="pt-12 pb-12">
                  <div className="text-center">
                    <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 font-medium">Nenhum pagamento realizado</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              paidPayments.map(payment => (
                <Card key={payment.id} className="border-green-200 bg-green-50">
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            {payment.workName}
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">
                            Parcela {payment.installmentNumber} de {payment.totalInstallments}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-green-600">
                            R$ {(payment.amount / 1000).toFixed(1)}k
                          </p>
                          <span className="inline-block px-3 py-1 text-xs font-semibold rounded mt-2 bg-green-100 text-green-700">
                            PAGO
                          </span>
                        </div>
                      </div>

                      <div className="border-t border-green-200 pt-4 grid grid-cols-2">
                        <div>
                          <p className="text-xs text-gray-600">Vencimento</p>
                          <p className="font-semibold text-gray-900 mt-1">
                            {new Date(payment.dueDate).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Data de Pagamento</p>
                          <p className="font-semibold text-gray-900 mt-1">
                            {payment.paidDate 
                              ? new Date(payment.paidDate).toLocaleDateString('pt-BR')
                              : '-'
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
