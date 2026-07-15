import { Suspense } from "react"
import { redirect } from "next/navigation"
import { SignInForm } from "@/components/auth/SignInForm"
import { getCurrentSession } from "@/lib/session"
import { ADMIN_ROLE } from "@/lib/auth-roles"

export const metadata = {
  title: "The Palum Dhara Community Gateway",
  description: "Secure gateway for Palum Dhara. Sign in or join our community to manage your regional selections, addresses, and view your profile.",
}

export default async function LoginPage() {
  const session = await getCurrentSession()

  if (session) {
    if (session.user.role === ADMIN_ROLE) {
      redirect("/admin")
    } else {
      redirect("/account")
    }
  }

  return (
    <main className="min-h-[85vh] flex flex-col justify-center items-center py-16 px-6 relative" id="login-gateway-page">
      {/* Editorial Decorative Frame */}
      <div className="absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-wood-light/15 to-transparent hidden lg:block" />
      <div className="absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-wood-light/15 to-transparent hidden lg:block" />

      <div className="w-full max-w-md mx-auto flex flex-col items-center">
        {/* Brand Eyebrow */}
        <span className="label-ornate mb-4 text-center" id="brand-gateway-eyebrow">
          PALUM DHARA HERITAGE
        </span>

        {/* Elegant Cormorant Headings */}
        <h1 className="heading-md text-center tracking-tight mb-3" id="brand-gateway-title">
          The Palum Dhara Community
        </h1>
        
        <p className="body-lg text-center text-charcoal/60 text-sm max-w-sm mb-10 leading-relaxed" id="brand-gateway-subheading">
          Step into our mountain-facing kitchen. Gain custom access to regional harvest selections, subscription bundles, and artisanal stories.
        </p>

        {/* Branded Card Container with custom "warm-card" shadow and parchment border */}
        <div 
          className="w-full bg-ivory-dark/10 border border-wood-light/20 rounded-md p-8 md:p-10 warm-card"
          id="gateway-card"
        >
          <Suspense fallback={
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <div className="w-6 h-6 border-2 border-forest/20 border-t-forest rounded-full animate-spin" />
              <p className="text-[10px] text-charcoal/40 font-mono tracking-wider uppercase">Loading Gateway...</p>
            </div>
          }>
            <SignInForm defaultRedirect="/account" />
          </Suspense>
        </div>
      </div>
    </main>
  )
}
