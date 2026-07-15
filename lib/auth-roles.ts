// Single source of truth for role string values used by Better Auth's
// `admin` plugin (see lib/auth.ts). This is NOT the DEC-009 roles &
// permissions system from 09-admin-blueprint.md — that structure is
// still OPEN and untouched. This just avoids "admin" as a magic string
// scattered across auth.ts, lib/session.ts, and the admin pages, so a
// future rename (e.g. to "owner") is a one-line change.

export const ADMIN_ROLE = "admin" as const
export const DEFAULT_ROLE = "user" as const

export type UserRole = typeof ADMIN_ROLE | typeof DEFAULT_ROLE
