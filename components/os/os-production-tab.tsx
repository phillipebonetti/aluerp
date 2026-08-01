'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CreateProductionStageSchema } from '@/src/lib/schemas/os'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { addProductionStage, updateProductionStage, deleteProductionStage } from '@/app/actions/os'
import { formatDate } from '@/src/lib/utils'
import type { OSProductionStage } from '@/src/types/os'
import { Trash2, Edit2 } from 'lucide-react'

interface OSProductionTabProps {
  serviceOrderId: string
  stages: OSProductionStage[]
  employees?: Array<{ id: string; name: string }>
  onStageAdded?: (stage: OSProductionStage) => void
  onStageUpdated?: (stage: OSProductionStage) => void
  onStageDeleted?: (stageId: string) => void
}

const statusConfig = {
  PENDING: { label: 'Pendente', variant: 'outline' as const, color: 'bg-gray-100' },
  IN_PROGRESS: { label: 'Em Andamento', variant: 'default' as const, color: 'bg-blue-100' },
  COMPLETED: { label: 'Concluído', variant: 'secondary' as const, color: 'bg-green-100' },
  BLOCKED: { label: 'Bloqueado', variant: 'destructive' as const, color: 'bg-red-100' },
}

export function OSProductionTab({
  serviceOrderId,
  stages = [],
  employees = [],
  onStageAdded,
  onStageUpdated,
  onStageDeleted,
}: OSProductionTabProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm({
    resolver: zodResolver(CreateProductionStageSchema),
    defaultValues: {
      sequence: (stages.length || 0) + 1,
      name: '',
      responsibleId: undefined,
      notes: undefined,
    },
  })

  async function onSubmit(values: any) {
    try {
      setIsSubmitting(true)

      if (editingId) {
        const result = await updateProductionStage(editingId, {
          responsibleId: values.responsibleId,
          notes: values.notes,
        })
        onStageUpdated?.(result)
      } else {
        const result = await addProductionStage(serviceOrderId, values)
        onStageAdded?.(result)
      }

      form.reset()
      setIsOpen(false)
      setEditingId(null)
    } catch (error) {
      console.error('Error saving production stage:', error)
      form.setError('root', { message: 'Erro ao salvar etapa de produção' })
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDelete(stageId: string) {
    if (confirm('Tem certeza que deseja deletar esta etapa?')) {
      try {
        await deleteProductionStage(stageId)
        onStageDeleted?.(stageId)
      } catch (error) {
        console.error('Error deleting production stage:', error)
      }
    }
  }

  function handleEdit(stage: OSProductionStage) {
    form.reset({
      sequence: stage.sequence,
      name: stage.name,
      responsibleId: stage.responsibleId || undefined,
      notes: stage.notes || undefined,
    })
    setEditingId(stage.id)
    setIsOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Etapas de Produção</h3>
        <Dialog
          open={isOpen}
          onOpenChange={(open) => {
            setIsOpen(open)
            if (!open) {
              setEditingId(null)
              form.reset()
            }
          }}
        >
          <DialogTrigger asChild>
            <Button>Adicionar Etapa</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? 'Editar Etapa' : 'Adicionar Etapa de Produção'}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome da Etapa</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Corte, Dobra, Soldagem" {...field} disabled={!!editingId} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="sequence"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sequência</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
                          disabled={!!editingId}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="responsibleId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Responsável</FormLabel>
                      <Select value={field.value || ''} onValueChange={(v) => field.onChange(v || undefined)}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um responsável" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">Nenhum</SelectItem>
                          {employees.map((emp) => (
                            <SelectItem key={emp.id} value={emp.id}>
                              {emp.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {form.formState.errors.root && (
                  <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                    {form.formState.errors.root.message}
                  </div>
                )}

                <div className="flex gap-2">
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Salvando...' : editingId ? 'Atualizar' : 'Adicionar'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                    Cancelar
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {stages.length > 0 ? (
        <div className="space-y-3">
          {stages
            .sort((a, b) => a.sequence - b.sequence)
            .map((stage, index) => {
              const config = statusConfig[stage.status as keyof typeof statusConfig]
              return (
                <div key={stage.id} className={`border rounded-lg p-4 ${config.color}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white border-2 border-gray-300 font-semibold">
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="font-semibold text-base">{stage.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            Responsável: {stage.responsible?.name || 'Sem atribuição'}
                          </p>
                        </div>
                      </div>

                      {stage.notes && <p className="text-sm mt-2 text-muted-foreground ml-11">Nota: {stage.notes}</p>}

                      <div className="flex items-center gap-4 mt-3 ml-11 text-sm">
                        <Badge variant={config.variant}>{config.label}</Badge>
                        {stage.startDate && <span className="text-muted-foreground">Início: {formatDate(stage.startDate)}</span>}
                        {stage.endDate && <span className="text-muted-foreground">Fim: {formatDate(stage.endDate)}</span>}
                        {stage.actualEndDate && <span className="text-muted-foreground">Concluído: {formatDate(stage.actualEndDate)}</span>}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(stage)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(stage.id)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          Nenhuma etapa de produção adicionada. Clique em "Adicionar Etapa" para começar.
        </div>
      )}
    </div>
  )
}
