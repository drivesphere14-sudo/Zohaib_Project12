import Link from "next/link"
import { ArrowRight } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Background car image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
        style={{ backgroundImage: "url('/images/hero-car.jpg')" }}
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-background/60" aria-hidden="true" />

      <div className="relative z-10 mx-auto max-w-5xl px-6 text-center pt-24">
        <h1 className="text-balance">
          <span className="block font-serif text-5xl font-bold tracking-tight text-foreground md:text-7xl lg:text-8xl">
            Optimal mobility
          </span>
          <span className="block mt-2">
            <span className="font-serif text-5xl font-bold tracking-tight text-foreground md:text-7xl lg:text-8xl">
              meets{" "}
            </span>
            <span className="font-serif text-5xl font-bold italic text-accent md:text-7xl lg:text-8xl">
              exquisite design
            </span>
          </span>
        </h1>

        <p className="mx-auto mt-8 max-w-2xl text-lg text-muted-foreground text-pretty">
          Elevating the standard of vehicle rentals through architectural
          precision and seamless IoT technology.
        </p>

        {/* Single login entry */}
        <div className="mt-16 mx-auto max-w-xl">
          <Link
            href="/auth/login"
            className="group relative block rounded-xl border border-border bg-card/80 backdrop-blur-sm px-8 py-10 text-left transition-all hover:shadow-lg hover:border-accent/30"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Portal
            </p>
            <h3 className="mt-3 font-serif text-2xl font-bold text-card-foreground">
              Sign in to your account
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Access your dashboard after a single sign-in, whether you’re a renter or an owner.
            </p>
            <ArrowRight className="mt-4 h-5 w-5 text-accent opacity-0 transition-opacity group-hover:opacity-100" />
          </Link>
        </div>
      </div>
    </section>
  )
}
