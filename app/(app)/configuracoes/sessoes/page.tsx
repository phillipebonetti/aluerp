'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { formatDistance } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { getUserSessions, revokeSession, revokeAllSessions } from '@/src/actions/security'

export const metadata = {
  title: 'Minhas Sessões',
  description: 'Gerenciar suas sessões ativas',
}

function getDeviceIcon(deviceName?: string) {
  if (!deviceName) return '📱'
  if (deviceName.includes('Windows')) return '🖥️'
  if (deviceName.includes('Mac')) return '🍎'
  if (deviceName.includes('Linux')) return '🐧'
  if (deviceName.includes('iPhone')) return '📱'
  if (deviceName.includes('Android')) return '🤖'
  return '💻'
}

export default function SessionsPage() {
  const { data: session } = useSession()
  const [companyId] = useState('') // Get from session

  // Fetch sessions
  const { data: sessions, isLoading, refetch } = useQuery({
    queryKey: ['sessions', session?.user?.id],
    queryFn: () =>
      session?.user?.id ? getUserSessions(session.user.id, companyId) : [],
    enabled: !!session?.user?.id,
  })

  // Revoke session mutation
  const revokeSessionMutation = useMutation({
    mutationFn: (sessionId: string) =>
      revokeSession(sessionId, session?.user?.id || ''),
    onSuccess: () => {
      refetch()
    },
  })

  // Revoke all sessions mutation
  const revokeAllMutation = useMutation({
    mutationFn: () =>
      revokeAllSessions(session?.user?.id || '', companyId),
    onSuccess: () => {
      refetch()
    },
  })

  const currentSession = sessions?.find(
    (s: any) => s.id === (session as any)?.sessionId
  )
  const otherSessions = sessions?.filter(
    (s: any) => s.id !== (session as any)?.sessionId
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Minhas Sessões</h1>
          <p className="text-gray-600 mt-2">
            Gerencie seus dispositivos e sessões ativas
          </p>
        </div>
        {otherSessions && otherSessions.length > 0 && (
          <Button
            variant="destructive"
            onClick={() => revokeAllMutation.mutate()}
            disabled={revokeAllMutation.isPending}
          >
            Encerrar Todas as Outras Sessões
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="text-center text-gray-500 py-8">Carregando...</div>
      ) : (
        <div className="space-y-4">
          {/* Current Session */}
          {currentSession && (
            <div>
              <h2 className="font-semibold text-lg mb-3">Sessão Atual</h2>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex gap-4 flex-1">
                    <div className="text-3xl">
                      {getDeviceIcon(currentSession.deviceName)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">
                        {currentSession.deviceName || 'Dispositivo Desconhecido'}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {currentSession.browser || 'Navegador desconhecido'}
                      </p>
                      <p className="text-sm text-gray-600">
                        {currentSession.operatingSystem || 'SO desconhecido'}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        {currentSession.ipAddress || 'IP desconhecido'}
                      </p>
                      <p className="text-xs text-gray-500">
                        Última atividade:{' '}
                        {formatDistance(
                          new Date(currentSession.lastActivityAt),
                          new Date(),
                          { addSuffix: true, locale: ptBR }
                        )}
                      </p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                    Ativa
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Other Sessions */}
          {otherSessions && otherSessions.length > 0 && (
            <div>
              <h2 className="font-semibold text-lg mb-3">
                Outras Sessões ({otherSessions.length})
              </h2>
              <div className="space-y-3">
                {otherSessions.map((sess: any) => (
                  <div
                    key={sess.id}
                    className="bg-white border rounded-lg p-4 flex items-start justify-between"
                  >
                    <div className="flex gap-4 flex-1">
                      <div className="text-3xl">
                        {getDeviceIcon(sess.deviceName)}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">
                          {sess.deviceName || 'Dispositivo Desconhecido'}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {sess.browser || 'Navegador desconhecido'}
                        </p>
                        <p className="text-sm text-gray-600">
                          {sess.operatingSystem || 'SO desconhecido'}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          {sess.ipAddress || 'IP desconhecido'}
                        </p>
                        <p className="text-xs text-gray-500">
                          Última atividade:{' '}
                          {formatDistance(
                            new Date(sess.lastActivityAt),
                            new Date(),
                            { addSuffix: true, locale: ptBR }
                          )}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => revokeSessionMutation.mutate(sess.id)}
                      disabled={revokeSessionMutation.isPending}
                    >
                      Encerrar
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!currentSession && (!otherSessions || otherSessions.length === 0) && (
            <div className="text-center text-gray-500 py-8">
              Nenhuma sessão ativa encontrada
            </div>
          )}
        </div>
      )}

      {/* Info Box */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="font-semibold text-yellow-900 mb-2">
          Segurança da Conta
        </h3>
        <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
          <li>
            Revise regularmente suas sessões ativas
          </li>
          <li>
            Encerre sessões que você não reconhecer
          </li>
          <li>
            Use senhas fortes e altere-as periodicamente
          </li>
        </ul>
      </div>
    </div>
  )
}
