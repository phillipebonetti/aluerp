'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { generateOSFromQuote } from '@/app/actions/quote-to-os'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, FileText } from 'lucide-react'

const GenerateOSSchema = z.object({
  downPayment: z.string().optional().transform((v) => (v ? parseFloat(v) : 0)),
  installments: z.string().optional().transform((v) => (v ? parseInt(v) : 1)),
  priority: z.enum(['BAIXA', 'NORMAL', 'ALTA', 'URGENTE']).optional(),
})

type GenerateOSInput = z.infer<typeof GenerateOSSchema>

interface GenerateOSButtonProps {
  quoteId: string
  companyId: string
  quoteNumber?: string
  totalValue?: number
  disabled?: boolean
}

export function GenerateOSButton({
  quoteId,
  companyId,
  quoteNumber,
  totalValue,
  disabled = false,
}: GenerateOSButtonProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<GenerateOSInput>({
    resolver: zodResolver(GenerateOSSchema),
    defaultValues: {
      downPayment: '0',
      installments: '1',
      priority: 'NORMAL',
    },
  })

  async function onSubmit(data: GenerateOSInput) {
    try {
      setIsLoading(true)

      const result = await generateOSFromQuote(companyId, quoteId, {
        downPayment: data.downPayment,
        installments: data.installments,
        priority: data.priority,
      })

      if (result.success) {
        // Close dialog and navigate to new OS
        setIsOpen(false)
        router.push(`/os/${result.serviceOrderId}`)
        router.refresh()
      }
    } catch (error) {
      console.error('Error generating OS:', error)
      form.setError('root', {
        message: error instanceof Error ? error.message : 'Failed to generate Service Order',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        disabled={disabled || isLoading}
        variant="default"
        size="sm"
        className="gap-2"
      >
        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
        {isLoading ? 'Gerando...' : 'Gerar OS'}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Gerar Ordem de Serviço</DialogTitle>
            <DialogDescription>
              Crie uma nova Ordem de Serviço a partir deste orçamento ({quoteNumber})
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {form.formState.errors.root && (
              <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
                {form.formState.errors.root.message}
              </div>
            )}

            <FormField
              control={form.control}
              name="downPayment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Entrada (R$)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="0.00" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="installments"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Número de Parcelas</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="1" min="1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prioridade</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a prioridade" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="BAIXA">Baixa</SelectItem>
                      <SelectItem value="NORMAL">Normal</SelectItem>
                      <SelectItem value="ALTA">Alta</SelectItem>
                      <SelectItem value="URGENTE">Urgente</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {totalValue && (
              <div className="p-3 rounded-md bg-muted">
                <p className="text-sm font-medium">Valor Total</p>
                <p className="text-lg font-bold">
                  R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            )}

            <div className="flex gap-2 justify-end pt-4">
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Gerando...' : 'Gerar OS'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
