/**
 * Sessão baseada em cookie para o modo preview.
 *
 * Guarda apenas o `userId` num cookie httpOnly. Não há assinatura criptográfica
 * porque este modo existe exclusivamente para demonstração sem backend — nunca
 * deve ser usado com dados reais. Em produção o Supabase Auth assume o controle
 * e este módulo não é chamado.
 */
import { cookies } from 'next/headers'
import { PREVIEW_SESSION_COOKIE } from '@/src/core/config'

const MAX_AGE = 60 * 60 * 24 * 7 // 7 dias

export async function setPreviewSession(userId: string) {
  const cookieStore = await cookies()
  cookieStore.set(PREVIEW_SESSION_COOKIE, userId, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: MAX_AGE,
  })
}

export async function getPreviewSessionUserId(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get(PREVIEW_SESSION_COOKIE)?.value ?? null
}

export async function clearPreviewSession() {
  const cookieStore = await cookies()
  cookieStore.delete(PREVIEW_SESSION_COOKIE)
}
