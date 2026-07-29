// Core Supabase Module
// ====================
// Centraliza clientes Supabase para server e browser

export { createClient as createServerClient } from '@/lib/supabase/server'
export * from '@/lib/supabase/client'
