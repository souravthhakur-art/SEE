import { NextRequest, NextResponse } from "next/server"
import { getSessionCookie } from "better-auth/cookies"

// Next.js 16 renamed middleware.ts -> proxy.ts with a `proxy` export
// (04-architecture.md confirms this project is on Next.js 16).
//
// This is a cookie-presence check only — fast, runs on every request, but
// not a security boundary (a spoofed cookie passes it). It exists purely
// to avoid rendering a protected route's shell to an obviously logged-out
// request. Every actual protected page/layout still calls
// requireSession()/requireAdminSession() from lib/session.ts, which does
// the real, database-backed check.
const PUBLIC_PATHS = new Set(["/admin/login", "/sign-in"])

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // These must stay reachable while logged out, or an anonymous visitor
  // gets redirected to the exact page they were just redirected away from.
  if (PUBLIC_PATHS.has(pathname)) {
    return NextResponse.next()
  }

  const sessionCookie = getSessionCookie(request)

  if (sessionCookie) {
    return NextResponse.next()
  }

  const signInPath = pathname.startsWith("/admin") ? "/admin/login" : "/sign-in"
  const redirectUrl = new URL(signInPath, request.url)
  redirectUrl.searchParams.set("redirectTo", pathname)
  return NextResponse.redirect(redirectUrl)
}

// Explicit positive matchers only — a global negative-lookahead matcher
// (e.g. "/((?!api|_next).*)")  is known to intercept /api/auth/* itself
// and produce a redirect loop on sign-in.
export const config = {
  matcher: ["/account/:path*", "/admin/:path*"],
}
