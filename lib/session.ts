import "server-only"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { ADMIN_ROLE } from "@/lib/auth-roles"

const UNAUTHORIZED_PATH = "/unauthorized"

export async function getCurrentSession() {
  return auth.api.getSession({ headers: await headers() })
}

// Full database-backed session check. Use in every protected Server
// Component/layout — the proxy.ts cookie check is an optimistic UX
// shortcut only, never the real guard (see proxy.ts).
export async function requireSession(redirectTo = "/sign-in") {
  const session = await getCurrentSession()

  if (!session) {
    redirect(redirectTo)
  }

  return session
}

// Sprint 1.3: unauthenticated and authenticated-but-not-admin are two
// different outcomes, not one. An unauthenticated visitor doesn't have
// an account yet — send them to log in. An authenticated non-admin
// already has a valid account that simply lacks permission — sending
// them back to /admin/login would just bounce them in a loop, since
// they're already signed in. That case goes to /unauthorized instead.
export async function requireAdminSession(loginRedirectTo = "/admin/login") {
  const session = await requireSession(loginRedirectTo)

  if (session.user.role !== ADMIN_ROLE) {
    redirect(UNAUTHORIZED_PATH)
  }

  return session
}
