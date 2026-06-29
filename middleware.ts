import { type NextRequest } from "next/server"
import { middleware as updateSession } from "@/lib/supabase/middleware"

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

// Protect all authentication-related routes
export const config = {
  matcher: [
    "/admin/:path*",
    "/dashboard/:path*",
    "/auth/:path*",
  ],
}
