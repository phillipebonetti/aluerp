'use client'

import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { EmptyState } from '@/components/ui/empty-state'
import { PageHeader } from '@/components/ui/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { LucideIcon } from 'lucide-react'

interface EntityRecord { id: string; name: string; status?: string; email?: string | null; phone?: string | null; client?: { name: string } | null }

type ApiPayload = {
  success?: boolean
  data?: unknown
  items?: unknown
  error?: string
  message?: string
}

function extractRecords(payload: ApiPayload | unknown): EntityRecord[] {
  if (Array.isArray(payload)) return payload as EntityRecord[]
  if (!payload || typeof payload !== 'object') throw new Error('Resposta inválida da API.')

  const record = payload as ApiPayload
  if (Array.isArray(record.items)) return record.items as EntityRecord[]
  if (Array.isArray(record.data)) return record.data as EntityRecord[]

  if (record.data && typeof record.data === 'object') {
    const nested = record.data as ApiPayload
    if (Array.isArray(nested.items)) return nested.items as EntityRecord[]
    if (Array.isArray(nested.data)) return nested.data as EntityRecord[]
  }

  throw new Error('A API retornou um formato de lista inválido.')
}

interface EntityCrudPageProps {
  title: string
  description: string
  singular: string
  endpoint: string
  icon: LucideIcon
}

export function EntityCrudPage({ title, description, singular, endpoint, icon: Icon }: EntityCrudPageProps) {
  const [items, setItems] = useState<EntityRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [saving, setSaving] = useState(false)

  const loadItems = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`${endpoint}?take=100`, { cache: 'no-store' })
      const payload = await response.json().catch(() => null) as ApiPayload | null
      if (!response.ok) {
        throw new Error(payload?.error || payload?.message || 'Não foi possível carregar os registros.')
      }
      setItems(extractRecords(payload))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar os registros.')
    } finally {
      setLoading(false)
    }
  }, [endpoint])

  // The initial fetch synchronizes this client page with the tenant-scoped API.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadItems()
  }, [loadItems])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim() || undefined, phone: phone.trim() || undefined }),
      })
      if (!response.ok) {
        const payload = await response.json().catch(() => null)
        throw new Error(payload?.error || 'Não foi possível salvar o registro.')
      }
      setOpen(false)
      setName(''); setEmail(''); setPhone('')
      toast.success(`${singular} criado com sucesso`)
      await loadItems()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao salvar o registro.'
      setError(message)
      toast.error(message)
    } finally { setSaving(false) }
  }

  return (
    <div className="mx-auto max-w-screen-2xl space-y-6 p-6">
      <PageHeader title={title} description={description} action={{ label: `Novo ${singular}`, onClick: () => setOpen(true) }} />
      <div className="flex items-center justify-between gap-4">
        <Input placeholder={`Buscar ${title.toLowerCase()}...`} className="max-w-sm" />
        <Button type="button" onClick={() => setOpen(true)}>Adicionar {singular}</Button>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>Novo {singular}</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <Input autoFocus placeholder="Nome" value={name} onChange={(event) => setName(event.target.value)} required />
              <Input type="email" placeholder="E-mail (opcional)" value={email} onChange={(event) => setEmail(event.target.value)} />
              <Input placeholder="Telefone (opcional)" value={phone} onChange={(event) => setPhone(event.target.value)} />
              <Button type="submit" disabled={saving}>{saving ? 'Salvando...' : 'Salvar'}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      {error && <div role="alert" className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">{error}</div>}
      {loading ? <div className="rounded-xl border bg-card p-12 text-center text-sm text-muted-foreground">Carregando...</div> : items.length === 0 ? (
        <div className="rounded-xl border bg-card"><EmptyState icon={Icon} title={`Nenhum ${singular.toLowerCase()} cadastrado`} description={`Cadastre ${singular.toLowerCase()}s para centralizar os dados do sistema.`} action={{ label: `Cadastrar ${singular}`, onClick: () => setOpen(true) }} /></div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => <div key={item.id} className="rounded-xl border bg-card p-5"><h2 className="font-semibold">{item.name}</h2><p className="mt-2 text-sm text-muted-foreground">{item.email || item.phone || item.client?.name || 'Sem informações adicionais'}</p><p className="mt-4 text-xs text-muted-foreground">{item.status || 'Ativo'}</p></div>)}
        </div>
      )}
    </div>
  )
}
