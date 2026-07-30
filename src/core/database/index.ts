/**
 * Ponto de entrada para acesso ao banco de dados do AluERP.
 * Exporta Prisma Client factory.
 */

export { getPrisma } from './client'

// Re-export como prisma para compatibilidade com code legado
export { getPrisma as prisma } from './client'
