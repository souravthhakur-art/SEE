/**
 * scripts/create-admin.ts
 *
 * Idempotent bootstrap for the first Palum Dhara admin account.
 *
 * Run with:  npm run create:admin
 *
 * --- Why this script exists ---
 * Better Auth's admin plugin (`auth.api.createUser`) is designed for an
 * ALREADY-ADMIN user to create more users from the dashboard. It requires
 * an authenticated admin session. On a fresh database there is no admin
 * yet, so that endpoint always returns "Unauthorized" — the exact
 * chicken-and-egg problem this script solves.
 *
 * Instead, this script uses `signUpEmail` — Better Auth's public,
 * unauthenticated registration endpoint. It performs the same
 * officially-supported password hashing as every other sign-up in the
 * app (via the configured emailAndPassword hasher) and creates the same
 * User + Account rows a real customer sign-up would. We then promote the
 * resulting user to "admin" with a single Prisma update to the plain
 * `role` column. That column write touches no password or session logic,
 * so it doesn't need to go through Better Auth's API — only the
 * credential-creation step does.
 *
 * --- Why a second, script-only Better Auth instance ---
 * The app's real instance (lib/auth.ts) includes the `nextCookies()`
 * plugin, which sets the session cookie via `next/headers`. That only
 * works inside an active Next.js request (Server Component, Route
 * Handler, or Server Action). This script runs standalone via `tsx` —
 * there is no request context — so reusing the app's instance directly
 * risks a `cookies() expects to have requestAsyncStorage, none available`
 * failure the moment sign-up tries to set a session cookie.
 *
 * The instance below mirrors lib/auth.ts exactly for everything that
 * affects the *data* it writes (Prisma adapter, the name→fullName field
 * mapping, the emailAndPassword config and therefore the password
 * hasher) and simply omits `nextCookies()` and `autoSignIn`, which a
 * background script has no use for. The user this creates is fully
 * compatible with the app's normal login flow.
 *
 * If lib/auth.ts's database or emailAndPassword config ever changes,
 * update the mirrored config below to match — flagged here rather than
 * silently risking drift, per CLAUDE.md.
 */

import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { prisma } from "../lib/prisma"
import { ADMIN_ROLE } from "../lib/auth-roles"

const ADMIN_EMAIL =
  process.env.ADMIN_BOOTSTRAP_EMAIL ?? "admin@palumdhara.in"
const ADMIN_NAME = "Palum Dhara Admin"

// Only used if ADMIN_BOOTSTRAP_PASSWORD is not set in the environment.
// Clearly marked so it can never be mistaken for a real credential.
const DEV_FALLBACK_PASSWORD = "DEV-ONLY-change-me-immediately-1234"

// Script-only auth instance — see file header for why this isn't just
// `import { auth } from "../lib/auth"`.
const bootstrapAuth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  user: {
    fields: {
      name: "fullName",
    },
  },
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    autoSignIn: false, // no session needed for a background bootstrap
  },
})

async function main() {
  console.log("Palum Dhara — Admin Bootstrap")
  console.log("------------------------------")

  const existing = await prisma.user.findUnique({
    where: { email: ADMIN_EMAIL },
    select: { id: true, role: true, createdAt: true },
  })

  if (existing) {
    console.log(`✅ Admin already exists: ${ADMIN_EMAIL}`)
    console.log(`   Role:      ${existing.role}`)
    console.log(`   Created:   ${existing.createdAt.toISOString()}`)
    console.log("   No changes made.")
    return
  }

  const envPassword = process.env.ADMIN_BOOTSTRAP_PASSWORD
  const isProduction = process.env.NODE_ENV === "production"

  if (!envPassword && isProduction) {
    console.error(
      "❌ Refusing to run: NODE_ENV=production and ADMIN_BOOTSTRAP_PASSWORD is not set.\n" +
        "   Set ADMIN_BOOTSTRAP_PASSWORD before bootstrapping a production admin account."
    )
    process.exitCode = 1
    return
  }

  if (!envPassword) {
    console.warn(
      "⚠️  ADMIN_BOOTSTRAP_PASSWORD is not set — using a clearly-marked development\n" +
        "   fallback password. Do not use this outside local development. Change it\n" +
        "   immediately after first login."
    )
  }

  const password = envPassword ?? DEV_FALLBACK_PASSWORD

  // Officially-supported credential creation: signUpEmail hashes the
  // password using Better Auth's configured hasher and creates the
  // matching User + Account rows. No manual hashing.
  const signUpResult = await bootstrapAuth.api.signUpEmail({
    body: {
      email: ADMIN_EMAIL,
      password,
      name: ADMIN_NAME, // remapped to User.fullName — see lib/auth.ts
    },
  })

  if (!signUpResult?.user?.id) {
    console.error("❌ signUpEmail did not return a user. Aborting — no role was set.")
    process.exitCode = 1
    return
  }

  // Promote to admin. Plain column write, no password/session logic —
  // does not need to go through Better Auth's API.
  const admin = await prisma.user.update({
    where: { id: signUpResult.user.id },
    data: { role: ADMIN_ROLE },
    select: { id: true, email: true, role: true, createdAt: true },
  })

  console.log("✅ Admin user created successfully.")
  console.log(`   ID:        ${admin.id}`)
  console.log(`   Email:     ${admin.email}`)
  console.log(`   Role:      ${admin.role}`)
  console.log(`   Created:   ${admin.createdAt.toISOString()}`)
  console.log(
    envPassword
      ? "   Password:  (from ADMIN_BOOTSTRAP_PASSWORD — not printed)"
      : `   Password:  ${DEV_FALLBACK_PASSWORD}  ⚠️  development fallback — change immediately`
  )
}

main()
  .catch((err) => {
    console.error("❌ Failed to bootstrap admin user:")
    console.error(err)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
