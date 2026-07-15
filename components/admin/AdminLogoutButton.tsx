"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { LogOut } from "lucide-react"
import { authClient } from "@/lib/auth-client"

interface AdminLogoutButtonProps {
  className?: string
}

export function AdminLogoutButton({ className = "" }: AdminLogoutButtonProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleLogout = async () => {
    setIsLoading(true)
    await authClient.signOut()
    router.push("/admin/login")
    router.refresh()
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isLoading}
      className={`flex w-full items-center gap-2 px-3 py-2 text-sm text-charcoal transition-colors hover:text-forest disabled:opacity-60 ${className}`}
    >
      <LogOut size={16} strokeWidth={1.75} aria-hidden="true" />
      {isLoading ? "Signing out…" : "Log out"}
    </button>
  )
}
