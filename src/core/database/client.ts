/**
 * Acesso ao Prisma Client com import tardio (lazy).
 *
 * `lib/generated/prisma` é um artefato de build gerado por `prisma generate`.
 * Num clone novo ou em CI ele pode não existir ainda — e no modo preview
 * (sem Supabase/DATABASE_URL) ele nunca é necessário.
 *
 * Por isso o import é feito sob demanda via `getPrisma()`, em vez de no topo
 * do módulo. Assim o modo preview nunca carrega o Prisma, e a ausência do
 * client gerado não derruba o app inteiro na raiz.
 */
import type { PrismaClient } from '../../../lib/generated/prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

/**
 * Retorna o singleton do Prisma Client, ou `null` se o client gerado
 * não estiver disponível. Callers devem tratar o `null`.
 */
export async function getPrisma(): Promise<PrismaClient | null> {
  if (globalForPrisma.prisma) return globalForPrisma.prisma

  try {
    const { PrismaClient: Client } = await import('../../../lib/generated/prisma/client')

    const client = new Client({
      accelerateUrl: process.env.DATABASE_URL ?? 'prisma://placeholder',
    })

    if (process.env.NODE_ENV !== 'production') {
      globalForPrisma.prisma = client
    }

    return client
  } catch {
    // Client não gerado ou sem credenciais — o caller usa o fallback.
    return null
  }
}
