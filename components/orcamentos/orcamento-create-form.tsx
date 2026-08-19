'use client'

import { useEffect, useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { createBudgetWithItems } from '@/src/modules/orcamentos/actions'

export function OrcamentoCreateForm({ onCreated }: { onCreated: () => void }) {
  const [isPending, startTransition] = useTransition()
  const [clientId, setClientId] = useState('')
  const [validUntil, setValidUntil] = useState('')
  const [notes, setNotes] = useState('')
  const [description, setDescription] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [unitPrice, setUnitPrice] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [clients, setClients] = useState<Array<{ id: string; name: string }>>([])
  const [clientsError, setClientsError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    fetch('/api/clientes?take=100', { cache: 'no-store' })
      .then(async (response) => {
        const payload = await response.json()
        if (!response.ok) throw new Error(payload?.error || 'Não foi possível carregar os clientes')
        if (active) setClients(payload.data?.data ?? payload.data?.items ?? payload.data ?? [])
      })
      .catch((reason: unknown) => {
        if (active) setClientsError(reason instanceof Error ? reason.message : 'Não foi possível carregar os clientes')
      })
    return () => { active = false }
  }, [])

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    startTransition(async () => {
      const result = await createBudgetWithItems({
        clientId: clientId.trim(),
        validUntil,
        notes: [description.trim(), notes.trim()].filter(Boolean).join('\n\n') || undefined,
        items: [{ description: description.trim(), quantity: Number(quantity), unitPrice: Number(unitPrice) }],
      })
      if (result.error) setError(result.error)
      else onCreated()
    })
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      {error && <div role="alert" className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}
      <label className="flex flex-col gap-2 text-sm">
        <span className="font-medium">Cliente</span>
        <select required value={clientId} onChange={(event) => setClientId(event.target.value)} disabled={isPending || clients.length === 0} className="h-9 rounded-md border bg-background px-3 text-sm">
          <option value="">Selecione um cliente</option>
          {clients.map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}
        </select>
      </label>
      {clientsError && <p className="text-sm text-destructive">{clientsError}</p>}
      <Input required type="date" value={validUntil} onChange={(event) => setValidUntil(event.target.value)} disabled={isPending} />
      <Input required placeholder="Descrição do item" value={description} onChange={(event) => setDescription(event.target.value)} disabled={isPending} />
      <div className="grid grid-cols-2 gap-3">
        <Input required type="number" min="0.001" step="0.001" placeholder="Quantidade" value={quantity} onChange={(event) => setQuantity(event.target.value)} disabled={isPending} />
        <Input required type="number" min="0" step="0.01" placeholder="Valor unitário" value={unitPrice} onChange={(event) => setUnitPrice(event.target.value)} disabled={isPending} />
      </div>
      <Textarea placeholder="Observações" value={notes} onChange={(event) => setNotes(event.target.value)} disabled={isPending} />
      <Button type="submit" disabled={isPending}>{isPending ? 'Salvando...' : 'Salvar orçamento'}</Button>
    </form>
  )
}
