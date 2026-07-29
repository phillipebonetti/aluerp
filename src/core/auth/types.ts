/**
 * Tipos de autenticação do AluERP.
 * Utilizados em ambos os modos: preview e production.
 */

export interface SessionUser {
  id: string
  name: string
  email: string
  avatar: string | null
}

export interface SessionCompany {
  id: string
  name: string
  logo: string | null
  plan: string
  role: string
}

export interface AppSession {
  user: SessionUser
  company: SessionCompany
}
