import { redirect } from "next/navigation"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getSessionOnce } from "./session"
import type { UserProfile } from "./types"

/**
 * Server-side helper to require admin access (for Server Components)
 * Uses session cache to prevent duplicate fetches
 *
 * Usage in admin pages:
 * export default async function AdminPage() {
 *   const profile = await requireAdmin()
 *   // Profile is guaranteed to have role === "admin"
 * }
 * 
 * Performance:
 * - Uses cached session if available in same request
 * - Single auth.getUser() + single profile query max
 * - Middleware already verified admin role
 */
export async function requireAdmin(req?: NextRequest): Promise<UserProfile | null> {
  // Use cached session to avoid repeated fetches
  const session = await getSessionOnce()

  if (!session || !session.user) {
    if (req) return null // API route - return null for auth error
    redirect("/auth/login")
  }

  const profile = session.profile

  if (!profile) {
    if (req) return null // API route - return null for auth error
    redirect("/auth/login")
  }

  // Check if user is admin
  if (profile.role !== "admin") {
    if (req) return null // API route - return null for auth error
    redirect("/dashboard")
  }

  return profile as UserProfile
}

/**
 * API Route helper to require admin access and return error response
 * Returns NextResponse error on auth failure, null on success
 * 
 * Usage in API routes:
 * export async function GET(req: NextRequest) {
 *   const authError = await requireAdminAPI(req)
 *   if (authError) return authError
 *   // Safe to proceed, user is admin
 * }
 */
export async function requireAdminAPI(req: NextRequest): Promise<NextResponse | null> {
  const session = await getSessionOnce()

  if (!session || !session.user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    )
  }

  const profile = session.profile

  if (!profile) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    )
  }

  // Check if user is admin
  if (profile.role !== "admin") {
    return NextResponse.json(
      { error: "Forbidden: Admin access required" },
      { status: 403 }
    )
  }

  return null // Authentication successful
}

/**
 * Get current user and profile (no role check)
 * Uses session cache to prevent duplicate fetches
 * Returns null if not authenticated
 */
export async function getCurrentUser() {
  // Use cached session
  const session = await getSessionOnce()

  if (!session) {
    return null
  }

  return session
}
