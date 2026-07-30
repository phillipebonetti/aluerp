'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createActivitySchema, type CreateActivityInput } from '@/src/lib/validations/crm'
import { Phone, MessageSquare, Mail, MapPin, Video, FileText } from 'lucide-react'

interface ActivityFormProps {
  onSubmit: (data: CreateActivityInput) => Promise<void>
  isLoading?: boolean
  defaultValues?: Partial<CreateActivityInput>
  leadId?: string
  opportunityId?: string
}

const ACTIVITY_TYPES = [
  { value: 'CALL', label: 'Ligação', icon: Phone },
  { value: 'WHATSAPP', label: 'WhatsApp', icon: MessageSquare },
  { value: 'EMAIL', label: 'Email', icon: Mail },
  { value: 'VISIT', label: 'Visita', icon: MapPin },
  { value: 'MEETING', label: 'Reunião', icon: Video },
  { value: 'COLLECTION', label: 'Cobrança', icon: FileText },
  { value: 'NOTE', label: 'Anotação', icon: FileText }
]

export function ActivityForm({
  onSubmit,
  isLoading = false,
  defaultValues,
  leadId,
  opportunityId
}: ActivityFormProps) {
  const form = useForm<CreateActivityInput>({
    resolver: zodResolver(createActivitySchema),
    defaultValues: {
      type: 'CALL',
      leadId,
      opportunityId,
      ...defaultValues
    }
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Activity Type */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Tipo de Atividade</h3>
          
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {ACTIVITY_TYPES.map(({ value, label, icon: Icon }) => (
                      <div
                        key={value}
                        onClick={() => field.onChange(value)}
                        className={`p-3 rounded-lg border-2 cursor-pointer transition flex flex-col items-center gap-2 ${
                          field.value === value
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="text-xs font-medium text-center">{label}</span>
                      </div>
                    ))}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </Card>

        {/* Activity Details */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Detalhes da Atividade</h3>
          
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título *</FormLabel>
                  <FormControl>
                    <Input placeholder="Breve descrição da atividade" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Detalhes completos da atividade"
                      className="min-h-24"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Contexto completo da interação com o cliente</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="result"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Resultado</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="O que foi alcançado nesta atividade"
                      className="min-h-16"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Resultado ou conclusão da atividade</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="nextAction"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Próxima Ação</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="O que deve ser feito na próxima vez"
                      className="min-h-16"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Próximos passos a serem tomados</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </Card>

        {/* Scheduling */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Agendamento</h3>
          
          <FormField
            control={form.control}
            name="scheduledFor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data e Hora (Opcional)</FormLabel>
                <FormControl>
                  <Input type="datetime-local" {...field} />
                </FormControl>
                <FormDescription>Deixe em branco para atividades de hoje</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </Card>

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? 'Salvando...' : 'Registrar Atividade'}
        </Button>
      </form>
    </Form>
  )
}
