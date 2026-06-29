"use client"

import { useState } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { PasswordToggleInput } from "@/components/auth/password-toggle-input"
import { toast } from "sonner"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()

    if (loading) return

    setLoading(true)

    try {
      const supabase = createClient()

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        toast.error(error.message)
        setLoading(false)
        return
      }

      if (!data.user) {
        toast.error("Failed to authenticate")
        setLoading(false)
        return
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single()

      if (profileError) {
        console.error(profileError)
        toast.error("Failed to load user profile")
        setLoading(false)
        return
      }

      const destination =
        profile?.role === "admin" ? "/admin" : "/dashboard"

      // Force full page reload so auth cookies are read correctly
      window.location.href = destination
    } catch (err) {
      console.error(err)
      toast.error("An unexpected error occurred")
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/login-bg.jpg')" }}
      />
      <div className="absolute inset-0 bg-black/40" />

      <div className="relative z-10 mx-4 w-full max-w-md rounded-2xl bg-card p-10 shadow-2xl">
        <Link
          href="/"
          className="mb-6 flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-accent"
        >
          ← Back to Home
        </Link>

        <h1 className="font-serif text-3xl font-bold italic">
          Sign In
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          Welcome back to Drive Sphere
        </p>

        <form onSubmit={handleLogin} className="mt-8 flex flex-col gap-5">
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-semibold"
            >
              Email
            </label>

            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-input bg-background px-4 py-3"
            />
          </div>

          <PasswordToggleInput
            id="password"
            label="Password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-primary py-3 font-semibold text-primary-foreground disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Don't have an account?
          </p>

          <Link
            href="/auth/sign-up"
            className="mt-1 inline-block text-sm font-bold hover:text-accent"
          >
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  )
}