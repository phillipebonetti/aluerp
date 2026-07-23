/**
 * Singleton do Prisma Client para Next.js com Prisma 7.
 * No Prisma 7 o construtor requer `accelerateUrl` ou `adapter`.
 * Aqui passamos a DATABASE_URL como accelerateUrl — quando a env var
 * não estiver definida, as chamadas ao banco falharão graciosamente
 * (getSession retorna null via try/catch).
 */
import { PrismaClient } from './generated/prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ accelerateUrl: process.env.DATABASE_URL ?? 'prisma://placeholder' })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
