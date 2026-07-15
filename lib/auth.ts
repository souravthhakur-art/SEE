import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { admin } from "better-auth/plugins"
import { nextCookies } from "better-auth/next-js"
import { prisma } from "@/lib/prisma"
import { ADMIN_ROLE, DEFAULT_ROLE } from "@/lib/auth-roles"

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET || "palum_dhara_default_secret_better_auth_12345678",
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  // Maps Better Auth's expected `name` field onto the existing
  // `User.fullName` column (00-decision-log.md DEC-004 / the approved
  // schema) instead of renaming or duplicating a column.
  user: {
    fields: {
      name: "fullName",
    },
  },

  // Only email/password is requested anywhere in the documentation set
  // (CLAUDE.md Technology Stack: "Authentication: Planned (Better Auth /
  // Auth.js)"). Social providers are not configured — not asked for.
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },

  plugins: [
    // Better Auth's own admin plugin. Adds role/banned/banReason/banExpires
    // as plain columns on User (see prisma/auth-schema-addition.prisma) —
    // this is not a Role/Permission model and does not resolve DEC-009
    // (the broader roles & permissions structure), which stays OPEN. It
    // exists only so /admin can be gated on a single "admin" role value.
    admin({
      defaultRole: DEFAULT_ROLE,
      adminRoles: [ADMIN_ROLE],
    }),

    // Must be listed last — lets Server Actions set the session cookie.
    nextCookies(),
  ],

  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // refresh once per day of activity
  },
})

export type Session = typeof auth.$Infer.Session
