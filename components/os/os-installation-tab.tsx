'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CreateInstallationSchema } from '@/lib/schemas/os'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Card } from '@/components/ui/card'
import { addInstallation, updateInstallation } from '@/app/actions/os'
import { formatDate } from '@/lib/utils'
import type { OSInstallation } from '@/types/os'
import { Calendar, MapPin, Phone, User } from 'lucide-react'

interface OSInstallationTabProps {
  serviceOrderId: string
  installation?: OSInstallation | null
  employees?: Array<{ id: string; name: string }>
  onInstallationSaved?: (installation: OSInstallation) => void
}

export function OSInstallationTab({
  serviceOrderId,
  installation,
  employees = [],
  onInstallationSaved,
}: OSInstallationTabProps) {
  const [isEditing, setIsEditing] = useState(!installation)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm({
    resolver: zodResolver(CreateInstallationSchema),
    defaultValues: {
      teamLeadId: installation?.teamLeadId || undefined,
      scheduledDate: installation?.scheduledDate || undefined,
      address: installation?.address || '',
      city: installation?.city || '',
      state: installation?.state || '',
      postalCode: installation?.postalCode || '',
      contactName: installation?.contactName || '',
      contactPhone: installation?.contactPhone || '',
      notes: installation?.notes || '',
    },
  })

  async function onSubmit(values: any) {
    try {
      setIsSubmitting(true)

      if (installation) {
        const result = await updateInstallation(installation.id, values)
        onInstallationSaved?.(result)
      } else {
        const result = await addInstallation(serviceOrderId, values)
        onInstallationSaved?.(result)
      }

      setIsEditing(false)
    } catch (error) {
      console.error('Error saving installation:', error)
      form.setError('root', { message: 'Erro ao salvar dados de instalação' })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isEditing && installation) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Dados da Instalação</h3>
          <Button onClick={() => setIsEditing(true)}>Editar</Button>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <Card className="p-6 space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Líder da Equipe</label>
              <p className="text-lg font-semibold">{installation.teamLead?.name || 'Não atribuído'}</p>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <div>
                <label className="text-sm font-medium text-muted-foreground">Data Agendada</label>
                <p className="font-semibold">{installation.scheduledDate ? formatDate(installation.scheduledDate) : 'Não agendado'}</p>
              </div>
            </div>

            {installation.startDate && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Início</label>
                  <p className="font-semibold">{formatDate(installation.startDate)}</p>
                </div>
              </div>
            )}

            {installation.actualEndDate && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-green-600" />
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Concluído</label>
                  <p className="font-semibold">{formatDate(installation.actualEndDate)}</p>
                </div>
              </div>
            )}
          </Card>

          <Card className="p-6 space-y-4">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-muted-foreground mt-1" />
              <div>
                <label className="text-sm font-medium text-muted-foreground">Endereço</label>
                <p className="font-semibold">{installation.address || '-'}</p>
                {installation.city && installation.state && (
                  <p className="text-sm text-muted-foreground">
                    {installation.city}, {installation.state}
                    {installation.postalCode && ` - ${installation.postalCode}`}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-start gap-2">
              <User className="w-4 h-4 text-muted-foreground mt-1" />
              <div>
                <label className="text-sm font-medium text-muted-foreground">Contato no Local</label>
                <p className="font-semibold">{installation.contactName || '-'}</p>
              </div>
            </div>

            {installation.contactPhone && (
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Telefone</label>
                  <p className="font-semibold">{installation.contactPhone}</p>
                </div>
              </div>
            )}
          </Card>
        </div>

        {installation.notes && (
          <Card className="p-6">
            <label className="text-sm font-medium text-muted-foreground">Notas</label>
            <p className="mt-2 whitespace-pre-wrap text-sm">{installation.notes}</p>
          </Card>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">{installation ? 'Editar Instalação' : 'Adicionar Instalação'}</h3>
        {installation && (
          <Button variant="outline" onClick={() => setIsEditing(false)}>
            Cancelar
          </Button>
        )}
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="teamLeadId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Líder da Equipe (Opcional)</FormLabel>
                <Select value={field.value || ''} onValueChange={(v) => field.onChange(v || undefined)}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um líder" />
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

          <FormField
            control={form.control}
            name="scheduledDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data Agendada (Opcional)</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    {...field}
                    value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-4 border-l-2 border-muted pl-4">
            <h4 className="font-semibold">Endereço de Instalação</h4>

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Endereço (Opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Rua, número, complemento" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cidade (Opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="São Paulo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado (Opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="SP" maxLength={2} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="postalCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CEP (Opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="00000-000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-4 border-l-2 border-muted pl-4">
            <h4 className="font-semibold">Contato no Local</h4>

            <FormField
              control={form.control}
              name="contactName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome (Opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome do contato" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contactPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefone (Opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="(11) 98765-4321" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notas (Opcional)</FormLabel>
                <FormControl>
                  <Textarea placeholder="Observações sobre a instalação" {...field} />
                </FormControl>
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
              {isSubmitting ? 'Salvando...' : installation ? 'Atualizar Instalação' : 'Adicionar Instalação'}
            </Button>
            {installation && (
              <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                Cancelar
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  )
}
