'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CreateCommentSchema } from '@/lib/schemas/os'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { Badge } from '@/components/ui/badge'
import { addOSComment } from '@/app/actions/os'
import { formatDate } from '@/lib/utils'
import type { OSCommentRecord } from '@/types/os'
import { MessageSquare, CheckCircle, AlertCircle, Paperclip } from 'lucide-react'

interface OSCommentsTabProps {
  serviceOrderId: string
  comments: OSCommentRecord[]
  onCommentAdded?: (comment: OSCommentRecord) => void
}

const typeConfig = {
  COMMENT: { icon: MessageSquare, label: 'Comentário', color: 'bg-blue-50', badge: 'default' },
  STATUS_CHANGE: { icon: CheckCircle, label: 'Mudança de Status', color: 'bg-green-50', badge: 'secondary' },
  NOTE: { icon: AlertCircle, label: 'Nota', color: 'bg-yellow-50', badge: 'outline' },
  ATTACHMENT_ADDED: { icon: Paperclip, label: 'Anexo Adicionado', color: 'bg-purple-50', badge: 'outline' },
}

export function OSCommentsTab({ serviceOrderId, comments = [], onCommentAdded }: OSCommentsTabProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm({
    resolver: zodResolver(CreateCommentSchema),
    defaultValues: {
      type: 'COMMENT',
      content: '',
    },
  })

  async function onSubmit(values: any) {
    try {
      setIsSubmitting(true)
      const result = await addOSComment(serviceOrderId, values)

      if (result?.id) {
        onCommentAdded?.(result)
        form.reset()
      }
    } catch (error) {
      console.error('Error adding comment:', error)
      form.setError('root', { message: 'Erro ao adicionar comentário' })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Agrupar comentários por data
  const sortedComments = [...comments].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const groupedComments: Record<string, OSCommentRecord[]> = {}
  sortedComments.forEach((comment) => {
    const date = new Date(comment.createdAt).toLocaleDateString('pt-BR')
    if (!groupedComments[date]) {
      groupedComments[date] = []
    }
    groupedComments[date].push(comment)
  })

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Adicionar Comentário</h3>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      placeholder="Digite seu comentário aqui..."
                      className="resize-none"
                      rows={4}
                      {...field}
                    />
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

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Adicionando...' : 'Adicionar Comentário'}
            </Button>
          </form>
        </Form>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Timeline</h3>

        {Object.entries(groupedComments).length > 0 ? (
          <div className="space-y-6">
            {Object.entries(groupedComments).map(([date, dateComments]) => (
              <div key={date}>
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-4">{date}</div>

                <div className="space-y-4">
                  {dateComments.map((comment, index) => {
                    const config = typeConfig[comment.type as keyof typeof typeConfig]
                    const Icon = config.icon

                    return (
                      <div key={comment.id} className={`border rounded-lg p-4 ${config.color}`}>
                        <div className="flex gap-3">
                          <div className="flex-shrink-0 pt-1">
                            <Icon className="w-5 h-5 text-muted-foreground" />
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant={config.badge as any}>{config.label}</Badge>
                              <span className="text-xs text-muted-foreground">{new Date(comment.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>

                            <p className="text-sm font-medium mb-1">{comment.author?.name || 'Sistema'}</p>
                            <p className="text-sm whitespace-pre-wrap text-foreground">{comment.content}</p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground border rounded-lg">
            Nenhum comentário ou atividade registrada ainda. Adicione um comentário acima.
          </div>
        )}
      </div>
    </div>
  )
}
