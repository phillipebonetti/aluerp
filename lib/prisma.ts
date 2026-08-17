import { PrismaClient } from '@/lib/generated/prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const databaseUrl = process.env.DATABASE_URL
const prismaOptions = databaseUrl
  ? { accelerateUrl: databaseUrl }
  : undefined

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient(prismaOptions)

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

export async function getPrisma(): Promise<PrismaClient> {
  return prisma
}

export default prisma
