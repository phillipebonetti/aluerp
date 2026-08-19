'use client'

import { useEffect, useState } from 'react'
import { FileText } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/ui/page-header'
import { EmptyState } from '@/components/ui/empty-state'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { OrcamentoCreateForm } from '@/components/orcamentos/orcamento-create-form'
import { getAllBudgets } from '@/src/modules/orcamentos/actions'

type Budget = { id: string; number: string; totalValue: number | string; status: string; client?: { name: string } | null }

export default function OrcamentosPage() {
  const [open, setOpen] = useState(false)
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [error, setError] = useState<string | null>(null)

  async function loadBudgets() {
    const result = await getAllBudgets()
    if (result.error) setError(result.error)
    else setBudgets((result.data ?? []) as Budget[])
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadBudgets()
  }, [])

  function created() {
    setOpen(false)
    toast.success('Orçamento criado com sucesso')
    void loadBudgets()
  }

  return (
    <div className="mx-auto flex max-w-screen-2xl flex-col gap-6 p-6">
      <PageHeader title="Orçamentos" description="Crie, envie e acompanhe orçamentos de esquadrias, vidros e instalações." action={{ label: 'Novo Orçamento', onClick: () => setOpen(true) }} />
      <Button type="button" onClick={() => setOpen(true)} className="w-fit">Novo Orçamento</Button>
      {error && <div role="alert" className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">{error}</div>}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Novo Orçamento</DialogTitle></DialogHeader>
          <OrcamentoCreateForm onCreated={created} />
        </DialogContent>
      </Dialog>
      {budgets.length === 0 ? (
        <div className="rounded-xl border bg-card"><EmptyState icon={FileText} title="Nenhum orçamento criado" description="Gere orçamentos profissionais com itens, metragens e valores de mão de obra." action={{ label: 'Criar Orçamento', onClick: () => setOpen(true) }} /></div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {budgets.map((budget) => <div key={budget.id} className="rounded-xl border bg-card p-5"><div className="flex items-center justify-between"><h2 className="font-semibold">Orçamento {budget.number}</h2><span className="text-xs text-muted-foreground">{budget.status}</span></div><p className="mt-2 text-sm text-muted-foreground">{budget.client?.name ?? 'Cliente não informado'}</p><p className="mt-4 font-medium">R$ {Number(budget.totalValue).toFixed(2)}</p></div>)}
        </div>
      )}
    </div>
  )
}

