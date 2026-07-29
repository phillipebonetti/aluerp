/**
 * Ponto de entrada para clientes Supabase do AluERP.
 * Exporta factory methods para server e browser.
 */

export { createClient as createServerClient } from './server'
export { createClient as createBrowserClient } from './client'
