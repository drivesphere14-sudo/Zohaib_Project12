/**
 * Configuration file for environment-specific settings
 * Usage: import config from '@/lib/config'
 */

interface Config {
  isDev: boolean
  isProd: boolean
  isPreview: boolean
  apiUrl: string
  supabaseUrl: string
  supabaseKey: string
  environment: "development" | "preview" | "production"
  logLevel: "debug" | "info" | "warn" | "error"
}

const config: Config = {
  // Environment checks
  isDev: process.env.NODE_ENV === "development",
  isProd: process.env.NODE_ENV === "production",
  isPreview: process.env.VERCEL_ENV === "preview",

  // API Configuration
  apiUrl:
    process.env.NEXT_PUBLIC_API_URL ||
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000"),

  // Supabase Configuration
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",

  // Environment name
  environment: (process.env.NODE_ENV as "development" | "preview" | "production") ||
    "development",

  // Log level based on environment
  logLevel:
    process.env.NODE_ENV === "production" ? ("warn" as const) : ("debug" as const),
}

// Validate required environment variables
if (process.env.NODE_ENV === "production") {
  if (!config.supabaseUrl || !config.supabaseKey) {
    console.error("Missing required Supabase environment variables in production")
  }
}

export default config
