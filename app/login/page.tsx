"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { signIn, signUp } from "@/lib/auth-client"
import { Loader2, ShieldCheck, Cpu } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      if (isSignUp) {
        if (!name) {
          setError("Name is required for sign up.")
          setLoading(false)
          return
        }
        await signUp.email({
          email,
          password,
          name,
          callbackURL: "/",
        })
      } else {
        await signIn.email({
          email,
          password,
          callbackURL: "/",
        })
      }
      router.push("/")
      router.refresh()
    } catch (err: any) {
      console.error(err)
      setError(err.message || "Authentication failed. Check database connection.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full bg-background overflow-hidden select-none">
      {/* Left panel - Side-by-side descriptive dashboard introduction (desktop only) */}
      <div className="hidden lg:flex flex-col justify-between w-[48%] border-r border-white/5 p-12 text-white bg-gradient-to-br from-[#060a13] via-[#0f172a] to-[#0a0e17] animate-gradient-shift">
        {/* Header Logo */}
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-white overflow-hidden shadow-md">
            <Image src="/route-x-logo.jpg" alt="RouteX Symbol" width={32} height={32} className="object-cover object-top" />
          </div>
          <span className="text-base font-bold tracking-wider text-white uppercase">RouteX</span>
        </div>

        {/* Dynamic Presentation Center (What We Are Building) */}
        <div className="space-y-12 my-auto max-w-md">
          <div className="space-y-5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-accent/20 text-accent border border-accent/25 select-none animate-pulse">
              ⚡ About RouteX
            </span>
            <h1 className="text-4xl lg:text-5xl font-black tracking-tight leading-tight text-white">
              Smart Transport Operations.
            </h1>
            <p className="text-sm lg:text-base text-white/80 leading-relaxed font-normal">
              <strong>RouteX</strong> is a next-generation fleet management platform that bridges live dispatching with relational database audits, replacing spreadsheets to prevent missed maintenance, cargo overloading, and driver oversights.
            </p>
          </div>

          {/* Glowing Mock Telemetry Console (Attractive Graphic Effect) */}
          <div className="rounded-xl border border-accent/20 bg-accent/5 p-6 space-y-5 shadow-lg animate-float relative overflow-hidden">
            {/* Visual shine overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none" />
            
            <div className="flex items-center justify-between text-sm text-accent">
              <span className="font-bold uppercase tracking-wider text-xs flex items-center gap-1.5">
                <Cpu className="size-4" />
                Active Telematics Shield
              </span>
              <span className="radar-ping size-2.5 rounded-full bg-accent" />
            </div>

            <div className="space-y-3.5 text-sm text-white/95 pl-1">
              <div className="flex items-center gap-3">
                <ShieldCheck className="size-5 text-emerald-400 shrink-0" />
                <span className="font-medium">Enforcing active cargo weight limits</span>
              </div>
              <div className="flex items-center gap-3">
                <ShieldCheck className="size-5 text-emerald-400 shrink-0" />
                <span className="font-medium">Auto-locking damaged vehicles for repairs</span>
              </div>
              <div className="flex items-center gap-3">
                <ShieldCheck className="size-5 text-emerald-400 shrink-0" />
                <span className="font-medium">Compiling real-time fuel efficiency & ROI</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-xs text-white/40 flex items-center justify-between pt-4 border-t border-white/5 shrink-0">
          <span>© {new Date().getFullYear()} RouteX Technologies Inc.</span>
          <span>Odoo Hackathon Entry</span>
        </div>
      </div>

      {/* Right panel - Glassmorphic login form */}
      <div className="flex flex-col justify-center items-center w-full lg:w-[52%] px-4 sm:px-6 lg:px-8 py-12 relative bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-background via-background to-accent/5 overflow-y-auto">
        <div className="w-full max-w-md space-y-6 rounded-2xl border border-border bg-card/65 p-8 shadow-xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-5 duration-500">
          <div className="flex flex-col items-center justify-center text-center">
            {/* Displays RouteX logo symbol, cropped top square */}
            <div className="flex size-14 items-center justify-center rounded-xl bg-white border border-border shadow-md mb-4 overflow-hidden">
              <Image src="/route-x-logo.jpg" alt="RouteX Symbol" width={56} height={56} className="object-cover object-top scale-105" />
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight text-foreground">
              {isSignUp ? "Get Started with RouteX" : "Sign in to RouteX"}
            </h2>
            <p className="mt-1.5 text-xs text-muted-foreground">
              {isSignUp
                ? "Register a fleet manager profile to begin."
                : "Enter credentials to access the operational control panel."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg bg-destructive/10 p-3.5 text-xs font-medium text-destructive">
                {error}
              </div>
            )}

            {isSignUp && (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">Full Name</label>
                <input
                  required
                  type="text"
                  placeholder="Krina Thakkar"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:border-ring transition-all"
                />
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Email address</label>
              <input
                required
                type="email"
                placeholder="manager@routex.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:border-ring transition-all"
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-muted-foreground">Password</label>
              </div>
              <input
                required
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:border-ring transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center rounded-lg bg-accent py-2.5 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90 disabled:opacity-55 cursor-pointer shadow-sm active:scale-98"
            >
              {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
              {isSignUp ? "Sign Up" : "Sign In"}
            </button>
          </form>

          <div className="text-center text-xs">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-muted-foreground hover:text-foreground font-medium underline underline-offset-4 cursor-pointer"
            >
              {isSignUp ? "Already have an account? Sign In" : "Don't have an account yet? Sign Up"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
