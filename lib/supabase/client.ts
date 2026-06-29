import { createClient as createSupabaseClient, type SupabaseClient } from "@supabase/supabase-js"

let supabaseClient: SupabaseClient | null = null

export function createClient(): SupabaseClient {
  if (supabaseClient) {
    return supabaseClient
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing Supabase environment variables")
  }

  supabaseClient = createSupabaseClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: false,
      detectSessionInUrl: true,
    },
  })

  return supabaseClient
}