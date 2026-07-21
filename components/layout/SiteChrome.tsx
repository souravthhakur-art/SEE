"use client"

import { usePathname } from "next/navigation"
import type { ReactNode } from "react"

interface SiteChromeProps {
  children: ReactNode
}

// Root layout.tsx currently renders <Navigation /> {children} <Footer />
// <WhatsAppFloat /> for every route (see 04-architecture.md). That's
// correct for the public site, but wrong for /admin — the admin shell
// has its own sidebar/header and shouldn't sit inside the marketing
// nav/footer/WhatsApp float as well.
//
// This component isn't wired into anything by this change (see
// CHANGES.md — I don't have the actual app/layout.tsx source to safely
// edit it). To use it: in the root layout, wrap the three public-chrome
// components in <SiteChrome> instead of rendering them unconditionally,
// e.g.:
//
//   <SiteChrome>
//     <Navigation />
//     {children}
//     <Footer />
//     <WhatsAppFloat />
//   </SiteChrome>
//
// and move {children} so it always renders outside the conditional if
// you'd rather keep the public chrome/children split explicit — the
// only requirement is that Navigation/Footer/WhatsAppFloat don't render
// under /admin.
export function SiteChrome({ children }: SiteChromeProps) {
  const pathname = usePathname()
  const isAdminRoute = pathname?.startsWith("/admin") ?? false

  if (isAdminRoute) {
    return null
  }

  return <>{children}</>
}
