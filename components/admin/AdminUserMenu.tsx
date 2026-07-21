"use client"

import { useEffect, useRef, useState } from "react"
import { ChevronDown } from "lucide-react"
import { authClient } from "@/lib/auth-client"
import { AdminLogoutButton } from "@/components/admin/AdminLogoutButton"

export function AdminUserMenu() {
  const [session, setSession] = useState<any>(null)
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    authClient.getSession().then((res) => {
      if (res && res.data) {
        setSession(res.data)
      }
    }).catch(err => {
      console.error("Failed to fetch admin session:", err)
    })
  }, [])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const name = session?.user?.name ?? "Admin"
  const email = session?.user?.email ?? ""
  const initial = name.charAt(0).toUpperCase()

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className="flex items-center gap-3 rounded-sm px-2 py-1.5 hover:bg-ivory-dark"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gold font-heading text-base text-forest">
          {initial}
        </span>
        <span className="hidden text-left sm:block">
          <span className="block font-body text-sm font-medium leading-tight text-charcoal">
            {name}
          </span>
          <span className="block text-xs leading-tight text-wood">{email}</span>
        </span>
        <ChevronDown
          size={16}
          className={`text-wood transition-transform ${isOpen ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-2 w-56 rounded-sm border border-wood-light/40 bg-ivory py-2 shadow-md"
        >
          <div className="border-b border-wood-light/30 px-3 pb-2">
            <p className="font-body text-sm font-medium text-charcoal">{name}</p>
            <p className="text-xs text-wood">{email}</p>
          </div>
          <div className="pt-1">
            <AdminLogoutButton />
          </div>
        </div>
      )}
    </div>
  )
}
