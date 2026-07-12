import type React from "react"
import type { Metadata, Viewport } from "next"
import { Manrope, Geist_Mono } from "next/font/google"
import { AppShell } from "@/components/app-shell"
import "./globals.css"

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-sans",
})

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  title: "RouteX — Smart Transport Operations",
  description:
    "Centralized fleet operations platform for managing vehicles, drivers, trips, maintenance, fuel, and performance.",
  generator: "v0.app",
}

export const viewport: Viewport = {
  themeColor: "#1e2a44",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="bg-background dark">
      <body className={`${manrope.variable} ${geistMono.variable} font-sans antialiased`}>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  )
}
