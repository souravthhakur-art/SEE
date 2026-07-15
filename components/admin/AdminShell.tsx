"use client"

import { useState, type ReactNode } from "react"
import { AdminSidebar } from "@/components/admin/AdminSidebar"
import { AdminHeader } from "@/components/admin/AdminHeader"

interface AdminShellProps {
  children: ReactNode
}

export function AdminShell({ children }: AdminShellProps) {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)

  return (
    <div className="min-h-screen bg-ivory">
      <AdminSidebar isOpen={isMobileNavOpen} onClose={() => setIsMobileNavOpen(false)} />

      <div className="flex min-h-screen flex-col lg:pl-64">
        <AdminHeader onOpenNav={() => setIsMobileNavOpen(true)} />
        <main className="flex-1 px-4 py-8 lg:px-10">{children}</main>
      </div>
    </div>
  )
}
