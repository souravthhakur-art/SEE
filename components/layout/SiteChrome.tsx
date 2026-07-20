"use client"

import { usePathname } from "next/navigation"
import type { ReactNode } from "react"
import Navigation from "./navigation"
import Footer from "./footer"
import WhatsAppFloat from "./whatsapp-float"

interface SiteChromeProps {
  children: ReactNode
}

// Root layout.tsx now wraps everything inside <SiteChrome>{children}</SiteChrome>.
// If it's an admin route, it bypasses the public layout features entirely.
// Otherwise, it wraps the children in the beautiful public header, footer, and floating buttons.
export function SiteChrome({ children }: SiteChromeProps) {
  const pathname = usePathname()
  const isAdminRoute = pathname?.startsWith("/admin") ?? false

  if (isAdminRoute) {
    return <>{children}</>
  }

  return (
    <div className="flex min-h-screen flex-col bg-ivory text-charcoal font-body antialiased selection:bg-gold-light/20 selection:text-charcoal" id="site-chrome-wrapper">
      <Navigation />
      <main className="flex-1" id="main-content-area">{children}</main>
      <Footer />
      <WhatsAppFloat />
    </div>
  )
}
