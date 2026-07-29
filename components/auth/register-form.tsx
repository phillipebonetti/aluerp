'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { Eye, EyeOff, UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { registerAction } from '@/src/modules/auth/actions'

export function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  async function handleSubmit(formData: FormData) {
    setError(null)
    startTransition(async () => {
      const result = await registerAction(formData)
      if (result?.error) setError(result.error)
    })
  }

  return (
    <div className="w-full max-w-sm">
      {/* Card */}
      <div className="bg-card border border-border rounded-xl shadow-sm p-8 space-y-6">
        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-xl font-semibold text-foreground text-balance">
            Criar sua conta
          </h1>
          <p className="text-sm text-muted-foreground">
            Comece gratis. Sem cartao de credito.
          </p>
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
              Nome completo
            </label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="Seu nome"
              autoComplete="name"
              required
              className="h-9"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="email" className="text-xs font-medium text-foreground">
              E-mail
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="seu@email.com.br"
              autoComplete="email"
              required
              className="h-9"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="password" className="text-xs font-medium text-foreground">
              Senha
            </label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Mínimo 6 caracteres"
                autoComplete="new-password"
                required
                className="h-9 pr-9"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="w-3.5 h-3.5" />
                ) : (
                  <Eye className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Mínimo de 6 caracteres.
            </p>
          </div>

          <Button
            type="submit"
            className="w-full h-9"
            disabled={isPending}
          >
            {isPending ? (
              <span className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Criando conta...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <UserPlus className="w-3.5 h-3.5" />
                Criar conta
              </span>
            )}
          </Button>
        </form>

        {/* Terms */}
        <p className="text-center text-[11px] text-muted-foreground leading-relaxed">
          Ao criar sua conta, você concorda com os{' '}
          <Link href="/termos" className="text-accent hover:underline">Termos de Uso</Link>
          {' '}e a{' '}
          <Link href="/privacidade" className="text-accent hover:underline">Política de Privacidade</Link>.
        </p>

        {/* Login link */}
        <p className="text-center text-sm text-muted-foreground">
          Já tem uma conta?{' '}
          <Link href="/login" className="text-accent hover:text-accent/80 font-medium transition-colors">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  )
}
