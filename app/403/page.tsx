'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export const metadata = {
  title: 'Acesso Negado',
  description: 'Você não tem permissão para acessar esta página',
}

export default function ForbiddenPage() {
  const router = useRouter()

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-md text-center space-y-6 px-4">
        {/* Icon */}
        <div className="inline-block">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4v2m0 0H9m3 0h3"
              />
            </svg>
          </div>
        </div>

        {/* Error Code */}
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            403
          </h1>
          <h2 className="text-2xl font-semibold text-gray-800">
            Acesso Negado
          </h2>
        </div>

        {/* Message */}
        <p className="text-gray-600 text-base leading-relaxed">
          Desculpe, você não tem permissão para acessar esta página.
          Entre em contato com o administrador do sistema se acredita que isso é um erro.
        </p>

        {/* Reasons */}
        <div className="bg-gray-50 rounded-lg p-4 text-left space-y-2">
          <p className="text-sm font-semibold text-gray-700">
            Possíveis motivos:
          </p>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Você não possui o perfil necessário</li>
            <li>• Sua sessão expirou</li>
            <li>• O recurso foi removido</li>
          </ul>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 justify-center pt-2">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="flex-1"
          >
            Voltar
          </Button>
          <Button
            onClick={() => router.push('/dashboard')}
            className="flex-1"
          >
            Ir ao Dashboard
          </Button>
        </div>

        {/* Help Link */}
        <p className="text-xs text-gray-500 pt-4">
          Precisa de ajuda?{' '}
          <a
            href="mailto:support@aluerp.com"
            className="text-blue-600 hover:text-blue-700 underline"
          >
            Contate o suporte
          </a>
        </p>
      </div>
    </main>
  )
}
