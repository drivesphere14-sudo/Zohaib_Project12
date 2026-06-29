import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function POST(request: NextRequest) {
  const body = await request.json()
  const email = body?.email?.toString() ?? ""
  const password = body?.password?.toString() ?? ""

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 })
  }

  const cookiesToSet: Array<{ name: string; value: string; options?: Record<string, unknown> }> = []

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(setCookies) {
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
    return NextResponse.json({ error: error.message }, { status: 401 })
  }

  if (!data.user) {
    return NextResponse.json({ error: "Failed to authenticate." }, { status: 401 })
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .single()

  if (profileError || !profile) {
    return NextResponse.json({ error: "Failed to load user profile." }, { status: 500 })
  }

  const response = NextResponse.json({ role: profile.role })

  cookiesToSet.forEach(({ name, value, options }) => {
    if (options) {
      response.cookies.set(name, value, options)
    } else {
      response.cookies.set(name, value)
    }
  })

  return response
}
