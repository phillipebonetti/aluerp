/**
 * Store em memória para o modo preview do AluERP.
 *
 * Espelha exatamente o shape retornado pelo Prisma (User, Company, CompanyMember)
 * para que `getSession()` produza o mesmo `AppSession` nos dois modos.
 *
 * ATENÇÃO: este store vive no processo do servidor. Ele é adequado apenas para
 * demonstração — reinicia a cada restart do dev server. Ao conectar o Supabase
 * e o Postgres, este arquivo deixa de ser utilizado.
 */

export interface PreviewUser {
  id: string
  name: string
  email: string
  password: string
  avatar: string | null
}

export interface PreviewCompany {
  id: string
  name: string
  cnpj: string | null
  phone: string | null
  email: string | null
  logo: string | null
  plan: string
}

export interface PreviewMember {
  userId: string
  companyId: string
  role: string
}

interface PreviewDB {
  users: PreviewUser[]
  companies: PreviewCompany[]
  members: PreviewMember[]
}

// Persiste no globalThis para sobreviver ao hot-reload do Next.js
const globalForPreview = globalThis as unknown as {
  aluerpPreviewDB: PreviewDB | undefined
}

/** Conta de demonstração semeada — permite login imediato sem registro. */
const DEMO_USER: PreviewUser = {
  id: 'demo-user-0001',
  name: 'Carlos Mendes',
  email: 'demo@aluerp.com',
  password: 'demo123',
  avatar: null,
}

const DEMO_COMPANY: PreviewCompany = {
  id: 'demo-company-0001',
  name: 'Alumínios ABC Ltda',
  cnpj: '12.345.678/0001-90',
  phone: '(11) 3456-7890',
  email: 'contato@aluminiosabc.com.br',
  logo: null,
  plan: 'PRO',
}

function createDB(): PreviewDB {
  return {
    users: [DEMO_USER],
    companies: [DEMO_COMPANY],
    members: [
      { userId: DEMO_USER.id, companyId: DEMO_COMPANY.id, role: 'OWNER' },
    ],
  }
}

export const previewDB: PreviewDB =
  globalForPreview.aluerpPreviewDB ?? createDB()

if (process.env.NODE_ENV !== 'production') {
  globalForPreview.aluerpPreviewDB = previewDB
}

// ─────────────────────────────────────────────
// Operações
// ─────────────────────────────────────────────

export function findUserByEmail(email: string): PreviewUser | undefined {
  return previewDB.users.find(
    (u) => u.email.toLowerCase() === email.toLowerCase()
  )
}

export function findUserById(id: string): PreviewUser | undefined {
  return previewDB.users.find((u) => u.id === id)
}

export function createUser(input: {
  name: string
  email: string
  password: string
}): PreviewUser {
  const user: PreviewUser = {
    id: `user-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: input.name,
    email: input.email,
    password: input.password,
    avatar: null,
  }
  previewDB.users.push(user)
  return user
}

export function createCompany(input: {
  name: string
  cnpj?: string
  phone?: string
  email?: string
  ownerId: string
}): PreviewCompany {
  const company: PreviewCompany = {
    id: `company-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: input.name,
    cnpj: input.cnpj ?? null,
    phone: input.phone ?? null,
    email: input.email ?? null,
    logo: null,
    plan: 'FREE',
  }
  previewDB.companies.push(company)
  previewDB.members.push({
    userId: input.ownerId,
    companyId: company.id,
    role: 'OWNER',
  })
  return company
}

/** Retorna a primeira membership do usuário com user e company populados. */
export function findMembershipByUserId(userId: string) {
  const member = previewDB.members.find((m) => m.userId === userId)
  if (!member) return null

  const user = findUserById(member.userId)
  const company = previewDB.companies.find((c) => c.id === member.companyId)
  if (!user || !company) return null

  return { ...member, user, company }
}
