'use client'

import { useEffect, useMemo, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { createLead, getLeads } from '@/src/modules/crm/actions/leads'
import { getCurrentCompanyIdAction } from '@/src/actions/integrations'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Phone } from 'lucide-react'
import type { CRMLead } from '@/src/modules/crm/types'

const STAGES = [
  { label: 'Novos', status: 'NEW' as const },
  { label: 'Contato realizado', status: 'CONTACTED' as const },
  { label: 'Qualificados', status: 'QUALIFIED' as const },
  { label: 'Convertidos', status: 'CONVERTED' as const },
  { label: 'Perdidos', status: 'LOST' as const },
]

export default function CommercialCRMPage() {
  const [leads, setLeads] = useState<CRMLead[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [leadName, setLeadName] = useState('')
  const [leadEmail, setLeadEmail] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let active = true
    async function load() {
      try {
        const companyId = await getCurrentCompanyIdAction()
        if (!companyId) throw new Error('Sessão não encontrada')
        const result = await getLeads(companyId)
        if (active) setLeads(result)
      } catch (cause) {
        if (active) setError(cause instanceof Error ? cause.message : 'Não foi possível carregar os leads')
      } finally {
        if (active) setLoading(false)
      }
    }
    void load()
    return () => { active = false }
  }, [])

  async function handleCreateLead(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!leadName.trim()) return
    setSaving(true)
    setError(null)
    try {
      const companyId = await getCurrentCompanyIdAction()
      if (!companyId) throw new Error('Sessão não encontrada')
      await createLead({ name: leadName.trim(), email: leadEmail.trim() || undefined, status: 'NEW', estimatedValue: 0, source: 'OUTRO' })
      setLeadName('')
      setLeadEmail('')
      setDialogOpen(false)
      const result = await getLeads(companyId)
      setLeads(result)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível criar o lead')
    } finally {
      setSaving(false)
    }
  }

  const totalPipeline = useMemo(
    () => leads.reduce((sum, lead) => sum + Number(lead.estimatedValue ?? 0), 0),
    [leads],
  )

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">Vendas - CRM</h1>
          <p className="mt-1 text-muted-foreground">Pipeline de vendas e gestão de leads</p>
        </div>
        <Button className="gap-2" onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4" />
          Novo Lead
        </Button>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>Novo Lead</DialogTitle></DialogHeader>
            <form onSubmit={handleCreateLead} className="flex flex-col gap-4">
              <Input autoFocus placeholder="Nome" value={leadName} onChange={(event) => setLeadName(event.target.value)} required />
              <Input type="email" placeholder="E-mail (opcional)" value={leadEmail} onChange={(event) => setLeadEmail(event.target.value)} />
              <Button type="submit" disabled={saving}>{saving ? 'Salvando...' : 'Salvar lead'}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {error && <Card className="p-4 text-sm text-destructive">{error}</Card>}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="p-4"><div className="text-sm text-muted-foreground">Funil total</div><div className="mt-2 text-2xl font-bold">R$ {totalPipeline.toLocaleString('pt-BR')}</div></Card>
        <Card className="p-4"><div className="text-sm text-muted-foreground">Leads ativos</div><div className="mt-2 text-2xl font-bold">{leads.filter((lead) => !['CONVERTED', 'LOST'].includes(lead.status)).length}</div></Card>
        <Card className="p-4"><div className="text-sm text-muted-foreground">Total de leads</div><div className="mt-2 text-2xl font-bold">{leads.length}</div></Card>
      </div>

      {loading ? <Card className="p-8 text-center text-muted-foreground">Carregando leads...</Card> : leads.length === 0 ? <Card className="p-8 text-center text-muted-foreground">Nenhum lead cadastrado para esta empresa.</Card> : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {STAGES.map((stage) => {
            const stageLeads = leads.filter((lead) => lead.status === stage.status)
            return <Card key={stage.status} className="bg-muted/30 p-4"><div className="mb-4"><h3 className="font-semibold text-sm">{stage.label}</h3><p className="text-xs text-muted-foreground">{stageLeads.length} leads</p></div><div className="space-y-3">{stageLeads.map((lead) => <Card key={lead.id} className="p-3"><div className="mb-2 font-semibold text-sm">{lead.name}</div><div className="mb-2 text-xs text-muted-foreground">{lead.email ?? 'Sem e-mail'}</div>{lead.phone && <div className="mb-2 flex items-center gap-2 text-xs"><Phone className="h-3 w-3" />{lead.phone}</div>}<Badge variant="outline">R$ {Number(lead.estimatedValue ?? 0).toLocaleString('pt-BR')}</Badge></Card>)}</div></Card>
          })}
        </div>
      )}
    </div>
  )
}
