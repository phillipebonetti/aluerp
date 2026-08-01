'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { validateBudgetToken, approveBudget, requestBudgetChanges } from '@/src/lib/budget-approval/service'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { AlertCircle, CheckCircle } from 'lucide-react'

interface BudgetData {
  id: string
  clientName: string
  clientEmail: string
  budgetNumber: string
  items: Array<{
    description: string
    quantity: number
    unitPrice: number
    total: number
  }>
  discount: number
  freight: number
  total: number
  observations: string
  paymentConditions: string
  fabricationDeadline: number
  installationDeadline: number
  guarantees: string
  attachments: Array<{ name: string; url: string }>
}

export default function PublicBudgetPage() {
  const params = useParams()
  const token = typeof params?.token === 'string' ? params.token : ''

  const [budget, setBudget] = useState<BudgetData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [confirmed, setConfirmed] = useState(false)
  const [approving, setApproving] = useState(false)
  const [showChangesDialog, setShowChangesDialog] = useState(false)
  const [changesReason, setChangesReason] = useState('')
  const [approved, setApproved] = useState(false)

  useEffect(() => {
    loadBudget()
  }, [token])

  const loadBudget = async () => {
    setLoading(true)
    try {
      // TODO: Buscar orçamento usando o token
      // const result = await validateBudgetToken(token)
      // if (!result.success) {
      //   setError(result.error)
      //   return
      // }
      // const budgetData = await fetchBudgetData(result.data.budgetId)
      // setBudget(budgetData)
    } catch (err) {
      setError('Erro ao carregar orçamento')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async () => {
    if (!confirmed) {
      setError('Você precisa confirmar que leu todas as informações')
      return
    }

    setApproving(true)
    try {
      const clientIp = await fetch('https://api.ipify.org?format=json')
        .then((r) => r.json())
        .then((d) => d.ip)

      // TODO: Chamar ação de aprovação
      // await approveBudget({
      //   token,
      //   clientIp,
      //   userAgent: navigator.userAgent,
      //   clientName: budget?.clientName || '',
      //   clientEmail: budget?.clientEmail || '',
      // })

      setApproved(true)
    } catch (err) {
      setError('Erro ao aprovar orçamento')
    } finally {
      setApproving(false)
    }
  }

  const handleRequestChanges = async () => {
    if (!changesReason.trim()) {
      setError('Descreva as alterações solicitadas')
      return
    }

    try {
      // TODO: Chamar ação de solicitação de alterações
      // await requestBudgetChanges(token, changesReason)
      setShowChangesDialog(false)
      setError('Sua solicitação de alterações foi enviada com sucesso')
    } catch (err) {
      setError('Erro ao enviar solicitação')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando orçamento...</p>
        </div>
      </div>
    )
  }

  if (error && !approved) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4">
        <div className="max-w-2xl mx-auto">
          <Card className="border-red-200 bg-red-50 p-6">
            <div className="flex gap-3">
              <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-900">Erro ao carregar orçamento</h3>
                <p className="text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  if (approved) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white p-4">
        <div className="max-w-2xl mx-auto">
          <Card className="border-green-200 bg-green-50 p-6 text-center">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-green-900 mb-2">Orçamento Aprovado!</h2>
            <p className="text-green-700">
              Sua aprovação foi registrada com sucesso. Você receberá um email de confirmação em breve.
            </p>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Aprovação de Orçamento</h1>
          <p className="text-gray-600">
            Por favor, revise todas as informações abaixo e aprove seu orçamento digitalmente
          </p>
        </div>

        {/* Budget Details */}
        <Card className="mb-6 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <p className="text-sm text-gray-600">Número do Orçamento</p>
              <p className="text-lg font-semibold">#{budget?.budgetNumber}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Cliente</p>
              <p className="text-lg font-semibold">{budget?.clientName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Validade</p>
              <p className="text-lg font-semibold">30 dias</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Prazo de Fabricação</p>
              <p className="text-lg font-semibold">{budget?.fabricationDeadline} dias</p>
            </div>
          </div>

          {/* Items Table */}
          <div className="mb-6">
            <h3 className="font-semibold mb-3">Itens do Orçamento</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left">Descrição</th>
                    <th className="px-3 py-2 text-right">Qtd</th>
                    <th className="px-3 py-2 text-right">Valor Unit.</th>
                    <th className="px-3 py-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {budget?.items.map((item, idx) => (
                    <tr key={idx} className="border-t">
                      <td className="px-3 py-2">{item.description}</td>
                      <td className="px-3 py-2 text-right">{item.quantity}</td>
                      <td className="px-3 py-2 text-right">R$ {item.unitPrice.toFixed(2)}</td>
                      <td className="px-3 py-2 text-right font-semibold">R$ {item.total.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals */}
          <div className="space-y-2 mb-6 text-right text-sm">
            <div className="flex justify-end gap-4">
              <span className="text-gray-600">Subtotal:</span>
              <span>R$ {((budget?.total || 0) + (budget?.discount || 0) - (budget?.freight || 0)).toFixed(2)}</span>
            </div>
            {budget?.discount ? (
              <div className="flex justify-end gap-4">
                <span className="text-gray-600">Desconto:</span>
                <span className="text-green-600">-R$ {budget.discount.toFixed(2)}</span>
              </div>
            ) : null}
            {budget?.freight ? (
              <div className="flex justify-end gap-4">
                <span className="text-gray-600">Frete:</span>
                <span>R$ {budget.freight.toFixed(2)}</span>
              </div>
            ) : null}
            <div className="flex justify-end gap-4 text-lg font-bold border-t pt-2">
              <span>Total:</span>
              <span>R$ {budget?.total.toFixed(2)}</span>
            </div>
          </div>

          {/* Additional Info */}
          {budget?.observations && (
            <div className="mb-4 p-3 bg-blue-50 rounded">
              <p className="text-sm font-semibold mb-1">Observações</p>
              <p className="text-sm text-gray-700">{budget.observations}</p>
            </div>
          )}

          {budget?.paymentConditions && (
            <div className="mb-4 p-3 bg-gray-50 rounded">
              <p className="text-sm font-semibold mb-1">Condições de Pagamento</p>
              <p className="text-sm text-gray-700">{budget.paymentConditions}</p>
            </div>
          )}

          {budget?.guarantees && (
            <div className="p-3 bg-gray-50 rounded">
              <p className="text-sm font-semibold mb-1">Garantias</p>
              <p className="text-sm text-gray-700">{budget.guarantees}</p>
            </div>
          )}
        </Card>

        {/* Confirmation */}
        <Card className="mb-6 p-6">
          <label className="flex items-start gap-3 cursor-pointer">
            <Checkbox checked={confirmed} onCheckedChange={setConfirmed} className="mt-1" />
            <span className="text-sm text-gray-700">
              Declaro que li todas as informações acima e estou de acordo com os termos e condições do orçamento.
            </span>
          </label>
        </Card>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            size="lg"
            className="flex-1"
            onClick={handleApprove}
            disabled={!confirmed || approving}
          >
            {approving ? 'Aprovando...' : 'Aprovar Orçamento'}
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => setShowChangesDialog(true)}
          >
            Solicitar Alterações
          </Button>
        </div>
      </div>

      {/* Changes Dialog */}
      <Dialog open={showChangesDialog} onOpenChange={setShowChangesDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Solicitar Alterações</DialogTitle>
            <DialogDescription>
              Descreva quais alterações você gostaria que fossem feitas no orçamento.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Descreva as alterações solicitadas..."
            value={changesReason}
            onChange={(e) => setChangesReason(e.target.value)}
            className="min-h-24"
          />
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setShowChangesDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleRequestChanges}>
              Enviar Solicitação
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
