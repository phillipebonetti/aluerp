import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@/lib/generated/prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const databaseUrl = process.env.DATABASE_URL

function createPrismaClient() {
  if (!databaseUrl) return null

  const adapter = new PrismaPg({ connectionString: databaseUrl })
  return new PrismaClient({ adapter })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production' && prisma) {
  globalForPrisma.prisma = prisma
}

export async function getPrisma(): Promise<PrismaClient> {
  if (!prisma) throw new Error('DATABASE_URL não configurada')
  return prisma
}

export default prisma
