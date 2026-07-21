import { Suspense } from "react"
import { requireSession } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { AccountDashboard } from "@/components/account/AccountDashboard"
import { redirect } from "next/navigation"

export const metadata = {
  title: "My Account — Palum Dhara",
  description: "Manage your profile, shipping coordinates, newsletter subscriptions, and security settings on Palum Dhara.",
}

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  // Ensure the user is fully authenticated. If not, redirect to /sign-in
  const session = await requireSession("/sign-in")

  // Fetch fresh profile data to get the latest DB state (e.g. phone, marketingConsent, name)
  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
      createdAt: true,
      marketingConsent: true,
    },
  })

  if (!dbUser) {
    // If user deleted from DB but has active cookie session, sign out and redirect
    redirect("/sign-in")
  }

  // Fetch all saved addresses for this user
  const dbAddresses = await prisma.address.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  })

  // Check if user is actively subscribed to the newsletter
  const subscriber = await prisma.newsletterSubscriber.findUnique({
    where: { email: dbUser.email },
  })

  const isNewsletterActive = subscriber?.isActive ?? false

  // Fetch all orders for this user
  const dbOrders = await prisma.order.findMany({
    where: { userId: session.user.id },
    include: {
      items: true,
      history: {
        orderBy: { createdAt: "desc" },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  return (
    <main className="section-padding py-12 md:py-16 min-h-screen" id="account-dashboard-page">
      {/* Page Header */}
      <div className="max-w-7xl mx-auto mb-10">
        <div className="flex items-center gap-2 mb-3 text-xs text-charcoal/50 font-mono tracking-wider">
          <span>PALUM DHARA</span>
          <span>/</span>
          <span className="text-forest">MY ACCOUNT</span>
        </div>
        <h1 className="heading-lg text-forest" id="account-page-title">
          My Account
        </h1>
        <p className="body-lg max-w-xl text-xs text-charcoal/50 mt-2">
          Your portal for seasonal culinary specialities, maker dispatches, and custom orders.
        </p>
      </div>

      {/* Interactive Account Dashboard Wrapper */}
      <div className="max-w-7xl mx-auto">
        <Suspense fallback={
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <div className="w-6 h-6 border-2 border-forest/20 border-t-forest rounded-full animate-spin" />
            <p className="text-[10px] text-charcoal/40 font-mono tracking-wider uppercase">Loading Dashboard...</p>
          </div>
        }>
          <AccountDashboard 
            user={dbUser} 
            addresses={dbAddresses} 
            newsletterActive={isNewsletterActive}
            orders={dbOrders}
          />
        </Suspense>
      </div>
    </main>
  )
}
