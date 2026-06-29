import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

interface CookieSetOptions {
  name: string
  value: string
  options?: Record<string, unknown>
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const email = body?.email?.toString().trim() ?? ""
    const password = body?.password?.toString() ?? ""

    // Validate inputs
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      )
    }

    const cookiesToSet: CookieSetOptions[] = []

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(setCookies: CookieSetOptions[]) {
            cookiesToSet.push(...setCookies)
          },
        },
      }
    )

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const { logger } = require("@/lib/logger")
        logger.warn("Auth error during signInWithPassword", { error: error.message })
      } catch {}

      console.error("Auth error:", error)
      return NextResponse.json(
        { error: error.message || "Failed to authenticate" },
        { status: 401 }
      )
    }

    if (!data.user) {
      console.error("No user returned from auth")
      return NextResponse.json(
        { error: "Failed to authenticate." },
        { status: 401 }
      )
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single()

    if (profileError) {
      console.error("Profile fetch error:", profileError)
      return NextResponse.json(
        { error: "Failed to load user profile." },
        { status: 500 }
      )
    }

    if (!profile) {
      console.error("No profile found for user:", data.user.id)
      return NextResponse.json(
        { error: "User profile not found." },
        { status: 500 }
      )
    }

    if (!profile.role) {
      console.error("No role assigned to user:", data.user.id)
      return NextResponse.json(
        { error: "User role not configured." },
        { status: 500 }
      )
    }

    // Log cookie metadata (names/options) to help debug set-cookie behavior in Vercel
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { logger } = require("@/lib/logger")
      const cookieMeta = cookiesToSet.map((c) => ({ name: c.name, options: c.options }))
      logger.info("Login success, cookies to set", { cookieMeta, userId: data.user.id })
    } catch {}

    const response = NextResponse.json({ role: profile.role }, { status: 200 })

    // Set cache control to prevent caching of sensitive login data
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")

    // Set cookies
    cookiesToSet.forEach(({ name, value, options }) => {
      if (options) {
        response.cookies.set(name, value, options)
      } else {
        response.cookies.set(name, value)
      }
    })

    return response
  } catch (error) {
    console.error("Login route error:", error)
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    )
  }
}
