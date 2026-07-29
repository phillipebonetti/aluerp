'use client'

import { useState, useTransition } from 'react'
import { Building2, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createCompanyAction } from '@/src/modules/auth/actions'

export function OnboardingForm({ userName }: { userName: string }) {
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  async function handleSubmit(formData: FormData) {
    setError(null)
    startTransition(async () => {
      const result = await createCompanyAction(formData)
      if (result?.error) setError(result.error)
    })
  }

  return (
    <div className="w-full max-w-md">
      {/* Card */}
      <div className="bg-card border border-border rounded-xl shadow-sm p-8 space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-accent/10 mx-auto mb-4">
            <Building2 className="w-6 h-6 text-accent" />
          </div>
          <h1 className="text-xl font-semibold text-foreground text-balance text-center">
            Bem-vindo, {userName.split(' ')[0]}!
          </h1>
          <p className="text-sm text-muted-foreground text-center">
            Antes de continuar, vamos configurar sua empresa no sistema.
          </p>
        </div>

        {/* Steps indicator */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full bg-success flex items-center justify-center">
              <svg className="w-3 h-3 text-success-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="text-xs text-muted-foreground">Conta criada</span>
          </div>
          <div className="flex-1 h-px bg-border" />
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full bg-accent flex items-center justify-center">
              <span className="text-[10px] font-semibold text-accent-foreground">2</span>
            </div>
            <span className="text-xs font-medium text-foreground">Empresa</span>
          </div>
          <div className="flex-1 h-px bg-border" />
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center">
              <span className="text-[10px] font-medium text-muted-foreground">3</span>
            </div>
            <span className="text-xs text-muted-foreground">Dashboard</span>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2.5">
            {error}
          </div>
        )}

        {/* Form */}
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="name" className="text-xs font-medium text-foreground">
              Nome da empresa <span className="text-destructive">*</span>
            </label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="Ex: Alumínios Silva Ltda"
              autoComplete="organization"
              required
              className="h-9"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label htmlFor="cnpj" className="text-xs font-medium text-foreground">
                CNPJ
                <span className="text-muted-foreground font-normal ml-1">(opcional)</span>
              </label>
              <Input
                id="cnpj"
                name="cnpj"
                type="text"
                placeholder="00.000.000/0001-00"
                className="h-9"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="phone" className="text-xs font-medium text-foreground">
                Telefone
                <span className="text-muted-foreground font-normal ml-1">(opcional)</span>
              </label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="(11) 99999-9999"
                className="h-9"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="email" className="text-xs font-medium text-foreground">
              E-mail da empresa
              <span className="text-muted-foreground font-normal ml-1">(opcional)</span>
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="contato@suaempresa.com.br"
              className="h-9"
            />
          </div>

          <Button
            type="submit"
            className="w-full h-9"
            disabled={isPending}
          >
            {isPending ? (
              <span className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Criando empresa...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Continuar para o Dashboard
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            )}
          </Button>
        </form>

        <p className="text-center text-xs text-muted-foreground">
          Essas informações podem ser alteradas depois em{' '}
          <span className="font-medium text-foreground">Configurações</span>.
        </p>
      </div>
    </div>
  )
}
