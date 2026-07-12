"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import {
  LayoutDashboard,
  Truck,
  Users,
  Route,
  Wrench,
  BarChart3,
  Menu,
  X,
  Bell,
  LogOut,
  LogIn,
  Sun,
  Moon,
  Activity,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useSession, signOut } from "@/lib/auth-client"

const nav = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/vehicles", label: "Vehicles", icon: Truck },
  { href: "/drivers", label: "Drivers", icon: Users },
  { href: "/trips", label: "Trips", icon: Route },
  { href: "/maintenance", label: "Maintenance", icon: Wrench },
  { href: "/reports", label: "Reports", icon: BarChart3 },
]

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()
  return (
    <nav className="flex flex-col gap-1 px-3">
      {nav.map((item) => {
        const active = pathname === item.href
        const Icon = item.icon
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-sidebar-accent text-accent-foreground"
                : "text-sidebar-muted hover:bg-white/5 hover:text-sidebar-foreground",
            )}
          >
            <Icon className="size-5 shrink-0" />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}

function Brand() {
  return (
    <div className="flex items-center gap-2.5 px-5 py-5">
      <div className="flex size-9 items-center justify-center rounded-lg bg-white shadow-inner overflow-hidden border border-border/10">
        <Image src="/route-x-logo.jpg" alt="RouteX Symbol" width={32} height={32} className="object-cover object-top scale-105" />
      </div>
      <div className="leading-tight">
        <p className="text-sm font-bold tracking-tight text-sidebar-foreground">RouteX</p>
        <p className="text-[11px] text-sidebar-muted">Fleet Operations</p>
      </div>
    </div>
  )
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { data: session } = useSession()

  // Theme settings
  const [theme, setTheme] = useState<"light" | "dark">("dark")
  const [showNotifications, setShowNotifications] = useState(false)

  // Load theme from localStorage after mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark"
    if (savedTheme) {
      setTheme(savedTheme)
    } else {
      setTheme("dark")
    }
  }, [])

  // Apply theme class on changes
  useEffect(() => {
    const root = window.document.documentElement
    console.log("[Theme Debug] Current state theme:", theme)
    if (theme === "dark") {
      root.classList.add("dark")
      console.log("[Theme Debug] Added 'dark' class. Root classes:", root.classList.toString())
    } else {
      root.classList.remove("dark")
      console.log("[Theme Debug] Removed 'dark' class. Root classes:", root.classList.toString())
    }
    localStorage.setItem("theme", theme)
  }, [theme])

  function toggleTheme() {
    setTheme((prev) => (prev === "light" ? "dark" : "light"))
  }

  async function handleSignOut() {
    await signOut()
    router.push("/login")
    router.refresh()
  }

  const isAuthPage = pathname === "/login"
  
  const userName = session?.user?.name ?? "Krina Thakkar"
  const userEmail = session?.user?.email ?? "manager@routex.com"
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase()

  const tickerItems = [
    { text: "TX-4521 (Freightliner) · On Trip", status: "info", icon: "🚚" },
    { text: "VN-0512 (Sprinter Van-05) · Available", status: "success", icon: "🟢" },
    { text: "BS-8830 (Volvo Coach) · In Shop (Transmission)", status: "warning", icon: "🔧" },
    { text: "Hana Kim (Safety Score: 97) · Active", status: "success", icon: "👤" },
    { text: "VN-3390 (Ford Transit) · On Trip", status: "info", icon: "🚚" },
    { text: "David Osei · Suspended (License Expired)", status: "destructive", icon: "🔴" },
    { text: "Priya Nair (Safety Score: 88) · Available", status: "success", icon: "👤" },
    { text: "TX-7712 (Kenworth T680) · Available", status: "success", icon: "🚚" },
  ]

  // Hide AppShell frame on /login page
  if (isAuthPage) {
    return <div className="w-full min-h-screen bg-background">{children}</div>
  }

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
        <Brand />
        <div className="mt-2 flex-1">
          <NavLinks />
        </div>
        <div className="border-t border-sidebar-border p-4">
          <div className="flex items-center justify-between gap-2.5 rounded-lg bg-white/5 p-3 min-w-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-semibold text-accent-foreground shadow-sm">
                {initials}
              </div>
              <div className="min-w-0 leading-tight">
                <p className="truncate text-sm font-medium text-sidebar-foreground">{userName}</p>
                <p className="truncate text-[10px] text-sidebar-muted">{userEmail}</p>
              </div>
            </div>
            {session ? (
              <button
                onClick={handleSignOut}
                title="Sign Out"
                className="text-sidebar-muted hover:text-sidebar-foreground transition-colors p-1.5 rounded-md hover:bg-white/5"
              >
                <LogOut className="size-4 shrink-0" />
              </button>
            ) : (
              <Link
                href="/login"
                title="Sign In"
                className="text-sidebar-muted hover:text-sidebar-foreground transition-colors p-1.5 rounded-md hover:bg-white/5"
              >
                <LogIn className="size-4 shrink-0" />
              </Link>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            aria-label="Close menu"
            className="absolute inset-0 bg-primary/60"
            onClick={() => setOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 flex w-64 flex-col bg-sidebar animate-in slide-in-from-left duration-200">
            <div className="flex items-center justify-between pr-3">
              <Brand />
              <button
                aria-label="Close menu"
                onClick={() => setOpen(false)}
                className="rounded-md p-2 text-sidebar-muted hover:text-sidebar-foreground"
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="mt-2 flex-1">
              <NavLinks onNavigate={() => setOpen(false)} />
            </div>
            <div className="border-t border-sidebar-border p-4">
              <div className="flex items-center justify-between gap-2.5 rounded-lg bg-white/5 p-3 min-w-0">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-semibold text-accent-foreground">
                    {initials}
                  </div>
                  <div className="min-w-0 leading-tight">
                    <p className="truncate text-sm font-medium text-sidebar-foreground">{userName}</p>
                    <p className="truncate text-[10px] text-sidebar-muted">{userEmail}</p>
                  </div>
                </div>
                {session && (
                  <button
                    onClick={handleSignOut}
                    title="Sign Out"
                    className="text-sidebar-muted hover:text-sidebar-foreground transition-colors p-1.5 rounded-md hover:bg-white/5"
                  >
                    <LogOut className="size-4 shrink-0" />
                  </button>
                )}
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* Main Container */}
      <div className="flex min-h-screen min-w-0 flex-1 flex-col lg:pl-64">
        {/* Header */}
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-border bg-card/90 px-4 backdrop-blur-md">
          <button
            aria-label="Open menu"
            onClick={() => setOpen(true)}
            className="rounded-md p-2 text-foreground hover:bg-secondary lg:hidden"
          >
            <Menu className="size-5" />
          </button>
          <div className="flex items-center gap-2 lg:hidden">
            <div className="flex size-6 items-center justify-center rounded-md bg-white overflow-hidden border border-border/20 shadow-inner">
              <Image src="/route-x-logo.jpg" alt="RouteX Symbol" width={24} height={24} className="object-cover object-top" />
            </div>
            <span className="text-sm font-bold">RouteX</span>
          </div>
          
          {/* Desktop Header Banner (representing RouteX Live Dashboard) */}
          <div className="hidden lg:flex items-center gap-3 pl-2">
            <div className="flex size-7 items-center justify-center rounded-md bg-white border border-border/40 shadow-xs overflow-hidden">
              <Image src="/route-x-logo.jpg" alt="RouteX Symbol" width={24} height={24} className="object-cover object-top" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-xs font-bold text-foreground tracking-wide">RouteX Platform</span>
              <span className="text-[9px] text-muted-foreground font-medium mt-0.5">Centralized Fleet Management Station</span>
            </div>
            <span className="h-4 w-px bg-border/80" />
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-accent/10 text-accent border border-accent/15 select-none">
              <span className="size-1.5 rounded-full bg-accent animate-ping mr-0.5" />
              Live System Online
            </span>
          </div>

          <div className="ml-auto flex items-center gap-1.5">
            {/* Theme Toggle Switch */}
            <button
              onClick={toggleTheme}
              className="rounded-md p-2 text-muted-foreground hover:bg-secondary hover:text-foreground transition-all duration-200 active:scale-95"
              title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
            >
              {theme === "light" ? <Moon className="size-5" /> : <Sun className="size-5 text-amber-500 animate-pulse" />}
            </button>

            {/* Notifications Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                aria-label="Notifications"
                className="relative rounded-md p-2 text-muted-foreground hover:bg-secondary hover:text-foreground transition-all duration-200 active:scale-95 cursor-pointer"
              >
                <Bell className="size-5" />
                <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-accent" />
              </button>

              {showNotifications && (
                <>
                  {/* Backdrop overlay to close when clicking outside */}
                  <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                  
                  {/* Floating Popover Card */}
                  <div className="absolute right-0 mt-2.5 w-80 rounded-xl border border-border bg-card p-4 shadow-xl z-50 animate-in fade-in slide-in-from-top-2 duration-200 text-left">
                    <div className="flex items-center justify-between border-b border-border pb-2.5 mb-2.5">
                      <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Operational Alerts</h4>
                      <span className="px-2 py-0.5 rounded-full bg-accent/10 text-accent font-bold uppercase text-[9px]">3 New</span>
                    </div>

                    <div className="space-y-3">
                      {/* Alert 1 */}
                      <div className="flex gap-2.5 text-xs border-b border-border/40 pb-2.5 min-w-0">
                        <span className="text-accent mt-0.5 shrink-0">⚠️</span>
                        <div className="space-y-0.5 min-w-0">
                          <p className="font-semibold text-foreground truncate">Cargo Overload Warning</p>
                          <p className="text-[10px] text-muted-foreground">Delhi Hub: Truck TX-4521 reached capacity lock.</p>
                        </div>
                      </div>

                      {/* Alert 2 */}
                      <div className="flex gap-2.5 text-xs border-b border-border/40 pb-2.5 min-w-0">
                        <span className="text-amber-500 mt-0.5 shrink-0">🔧</span>
                        <div className="space-y-0.5 min-w-0">
                          <p className="font-semibold text-foreground truncate">Maintenance Check Overdue</p>
                          <p className="text-[10px] text-muted-foreground">VN-0512 is scheduled for front brake repair.</p>
                        </div>
                      </div>

                      {/* Alert 3 */}
                      <div className="flex gap-2.5 text-xs min-w-0">
                        <span className="text-sky-400 mt-0.5 shrink-0">👤</span>
                        <div className="space-y-0.5 min-w-0">
                          <p className="font-semibold text-foreground truncate">Licence Expiration Alert</p>
                          <p className="text-[10px] text-muted-foreground">Driver Hana Kim's Class MC licence expires soon.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
            
            <div className="flex size-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground shadow-sm">
              {initials}
            </div>
            
            {session ? (
              <button
                onClick={handleSignOut}
                className="text-muted-foreground hover:text-foreground p-1.5 transition-colors rounded-md hover:bg-secondary"
                title="Sign Out"
              >
                <LogOut className="size-4 shrink-0" />
              </button>
            ) : (
              <Link
                href="/login"
                className="text-muted-foreground hover:text-foreground p-1.5 transition-colors rounded-md hover:bg-secondary"
                title="Sign In"
              >
                <LogIn className="size-4 shrink-0" />
              </Link>
            )}
          </div>
        </header>

        {/* Global Live Ticker representing RouteX live operations */}
        <div className="flex h-12 items-center overflow-hidden border-b border-border bg-gradient-to-r from-background via-card to-background select-none shadow-xs">
          <div className="relative flex flex-1 items-center overflow-hidden h-full">
            <div className="animate-marquee whitespace-nowrap flex items-center gap-5 text-xs font-semibold py-1">
              {/* Double items for seamless marquee loop */}
              {tickerItems.map((item, index) => (
                <span 
                  key={index} 
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium shadow-xs backdrop-blur-xs transition-transform hover:scale-102 select-none",
                    item.status === "success" && "border-success/30 bg-success/10 text-success-foreground",
                    item.status === "warning" && "border-warning/30 bg-warning/10 text-warning-foreground",
                    item.status === "destructive" && "border-destructive/30 bg-destructive/10 text-destructive-foreground",
                    item.status === "info" && "border-accent/30 bg-accent/10 text-accent-foreground"
                  )}
                >
                  <span className="text-xs">{item.icon}</span>
                  <span>{item.text}</span>
                </span>
              ))}
              {tickerItems.map((item, index) => (
                <span 
                  key={`dup-${index}`} 
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium shadow-xs backdrop-blur-xs transition-transform hover:scale-102 select-none",
                    item.status === "success" && "border-success/30 bg-success/10 text-success-foreground",
                    item.status === "warning" && "border-warning/30 bg-warning/10 text-warning-foreground",
                    item.status === "destructive" && "border-destructive/30 bg-destructive/10 text-destructive-foreground",
                    item.status === "info" && "border-accent/30 bg-accent/10 text-accent-foreground"
                  )}
                >
                  <span className="text-xs">{item.icon}</span>
                  <span>{item.text}</span>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <main className="w-full min-w-0 flex-1 overflow-x-hidden p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}
