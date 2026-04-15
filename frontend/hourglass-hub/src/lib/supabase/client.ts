import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables: VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY')
}

export const createClient = () => {
  return createSupabaseClient<Database>(supabaseUrl, supabaseAnonKey)
}

// Singleton instance for cases where you don't need a new client each time
export const supabase = createSupabaseClient<Database>(supabaseUrl, supabaseAnonKey)
