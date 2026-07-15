"use client"

import { Menu } from "lucide-react"
import { AdminBreadcrumbs } from "@/components/admin/AdminBreadcrumbs"
import { AdminUserMenu } from "@/components/admin/AdminUserMenu"

interface AdminHeaderProps {
  onOpenNav: () => void
}

export function AdminHeader({ onOpenNav }: AdminHeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-wood-light/30 bg-ivory px-4 py-4 lg:px-8">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenNav}
          className="rounded-sm p-1.5 text-charcoal hover:bg-ivory-dark lg:hidden"
          aria-label="Open navigation"
        >
          <Menu size={22} aria-hidden="true" />
        </button>
        <AdminBreadcrumbs />
      </div>

      <AdminUserMenu />
    </header>
  )
}
