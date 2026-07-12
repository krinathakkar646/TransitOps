import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const sessionToken =
    request.cookies.get("better-auth.session_token") ||
    request.cookies.get("__secure-better-auth.session_token")

  const isAuthPage = request.nextUrl.pathname.startsWith("/login")
  const isApiAuth = request.nextUrl.pathname.startsWith("/api/auth")

  // Skip middleware checking if database URL is empty or is using local docker placeholder
  // to avoid locking out developer before they configure a real Postgres DB.
  const dbUrl = process.env.DATABASE_URL
  const isDevBypass = !dbUrl || dbUrl.includes("localhost") || dbUrl.includes("127.0.0.1")

  if (isDevBypass) {
    return NextResponse.next()
  }

  if (isApiAuth) {
    return NextResponse.next()
  }

  if (!sessionToken && !isAuthPage) {
    const loginUrl = new URL("/login", request.url)
    return NextResponse.redirect(loginUrl)
  }

  if (sessionToken && isAuthPage) {
    const homeUrl = new URL("/", request.url)
    return NextResponse.redirect(homeUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\..*).*)", "/"],
}
