import { createClient } from "@/lib/supabase/server"
import { cache } from "react"
import type { UserProfile } from "./types"

/**
 * getSessionOnce — fetched once per request via React cache()
 * React's cache() is request-scoped in Server Components,
 * so it resets automatically between requests with no shared state.
 */
export const getSessionOnce = cache(async (): Promise<{
  user: { id: string; email?: string } | null
  profile: UserProfile | null
} | null> => {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  return {
    user: { id: user.id, email: user.email },
    profile: (profile as UserProfile) || null,
  }
})

/**
 * clearSessionCache — no-op now, kept for API compatibility
 * React cache() handles invalidation automatically per request.
 */
export function clearSessionCache() {}