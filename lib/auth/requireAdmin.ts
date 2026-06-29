import { redirect } from "next/navigation"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getSessionOnce } from "./session"
import type { UserProfile } from "./types"

/**
 * Require admin for Server Components.
 * Always returns a valid UserProfile.
 */
export async function requireAdmin(): Promise<UserProfile> {
  const session = await getSessionOnce()

  if (!session || !session.user) {
    redirect("/auth/login")
  }

  const profile = session.profile

  if (!profile) {
    redirect("/auth/login")
  }

  if (profile.role !== "admin") {
    redirect("/dashboard")
  }

  return profile as UserProfile
}

/**
 * Require admin for API Routes.
 * Returns an error response if authentication fails.
 */
export async function requireAdminAPI(
  req: NextRequest
): Promise<NextResponse | null> {
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

  if (profile.role !== "admin") {
    return NextResponse.json(
      { error: "Forbidden: Admin access required" },
      { status: 403 }
    )
  }

  return null
}

/**
 * Get current authenticated user.
 */
export async function getCurrentUser() {
  const session = await getSessionOnce()

  if (!session) {
    return null
  }

  return session
}