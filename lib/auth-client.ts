import { createAuthClient } from "better-auth/react"
import { adminClient } from "better-auth/client/plugins"

// Import only from Client Components. For Server Components/Route
// Handlers/Server Actions, use lib/session.ts instead.
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000",
  plugins: [adminClient()],
})

export const { useSession, signIn, signOut, signUp } = authClient
