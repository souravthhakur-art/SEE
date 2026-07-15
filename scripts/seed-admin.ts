/**
 * One-off admin bootstrap script.
 *
 * Purpose: Better Auth's admin plugin exposes admin-only APIs for
 * creating users and setting roles (e.g. auth.api.createUser,
 * auth.api.setRole) — but those calls themselves require an existing
 * admin session. This script exists only to create the very first
 * admin, since there's no admin yet to grant one via the normal API.
 *
 * This is an operational bootstrapping step, not a feature — it isn't
 * wired into the app, has no route, and shouldn't be. Run it once
 * against the target environment, then treat the credentials you used
 * as real account credentials (rotate the password after first login
 * if you typed it into a shared shell/CI log).
 *
 * Usage:
 *   SEED_ADMIN_EMAIL=owner@palumdhara.com \
 *   SEED_ADMIN_PASSWORD='use a real strong password here' \
 *   SEED_ADMIN_NAME='Palum Dhara Owner' \
 *   npx tsx prisma/seed-admin.ts
 *
 * (Add `tsx` as a devDependency if it isn't already installed:
 *   npm install -D tsx
 * — or swap the run command for `ts-node` if that's already in the
 * project instead. Neither is added to package.json dependencies by
 * this change; pick whichever the project already has, or install
 * `tsx` as the one new dev-only dependency this requires.)
 *
 * Safe to re-run: if the email already exists, it promotes that user to
 * admin instead of erroring; if it's already an admin, it's a no-op.
 */

import { auth } from "../lib/auth"
import { prisma } from "../lib/prisma"
import { ADMIN_ROLE } from "../lib/auth-roles"

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL
  const password = process.env.SEED_ADMIN_PASSWORD
  const fullName = process.env.SEED_ADMIN_NAME ?? "Admin"

  if (!email || !password) {
    console.error(
      "Set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD environment variables before running this script."
    )
    process.exit(1)
  }

  const existing = await prisma.user.findUnique({ where: { email } })

  if (existing) {
    if (existing.role === ADMIN_ROLE) {
      console.log(`${email} is already an admin. Nothing to do.`)
      return
    }

    await prisma.user.update({
      where: { email },
      data: { role: ADMIN_ROLE },
    })

    console.log(`Promoted existing user ${email} to "${ADMIN_ROLE}".`)
    return
  }

  // Goes through Better Auth's own sign-up path so the password is
  // hashed exactly the way the library expects at login time — this
  // script never constructs or writes a password hash by hand.
  await auth.api.signUpEmail({
    body: { email, password, name: fullName },
  })

  await prisma.user.update({
    where: { email },
    data: { role: ADMIN_ROLE },
  })

  console.log(`Created admin user ${email}.`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
