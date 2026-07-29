/**
 * Ponto de entrada para autenticação do AluERP.
 * Exporta tipos, utilitários e funções de sessão.
 */

export type { AppSession, SessionUser, SessionCompany } from './types'
export { getSession, getCurrentUser, hasIdentity } from './utils'
export { setPreviewSession, getPreviewSessionUserId, clearPreviewSession } from './preview/session'
export type { PreviewUser, PreviewCompany, PreviewMember } from './preview/store'
export { previewDB, findUserByEmail, findUserById, createUser, createCompany, findMembershipByUserId } from './preview/store'
