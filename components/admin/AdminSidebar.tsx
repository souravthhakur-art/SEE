"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { X } from "lucide-react"
import {
  ADMIN_NAV_TOP,
  ADMIN_NAV_GROUPS,
  ADMIN_NAV_BOTTOM,
  isNavItemActive,
  type AdminNavItem,
} from "@/lib/admin/nav-config"

interface AdminSidebarProps {
  isOpen: boolean
  onClose: () => void
}

interface NavLinkProps {
  item: AdminNavItem
  isActive: boolean
  onNavigate: () => void
}

function NavLink({ item, isActive, onNavigate }: NavLinkProps) {
  const Icon = item.icon

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={isActive ? "page" : undefined}
      className={`flex items-center gap-3 rounded-sm border-l-2 px-3 py-2 text-sm transition-colors ${
        isActive
          ? "border-gold bg-forest-light text-ivory"
          : "border-transparent text-ivory/70 hover:bg-forest-light/60 hover:text-ivory"
      }`}
    >
      <Icon size={18} strokeWidth={1.75} aria-hidden="true" />
      <span className="font-body">{item.label}</span>
    </Link>
  )
}

export function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname()

  return (
    <>
      {/* Mobile backdrop — clicking it closes the drawer. Hidden on desktop,
          where the sidebar is always docked. */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-charcoal/40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-forest transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-label="Admin navigation"
      >
        <div className="flex items-center justify-between gap-2 border-b border-ivory/10 px-6 py-6">
          <div>
            <p className="font-heading text-2xl leading-none text-ivory">Palum Dhara</p>
            <p className="label mt-1 text-gold-light">Admin</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-sm p-1 text-ivory/70 hover:text-ivory lg:hidden"
            aria-label="Close navigation"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        <nav className="flex-1 space-y-6 overflow-y-auto px-4 py-6">
          <div className="space-y-1">
            {ADMIN_NAV_TOP.map((item) => (
              <NavLink
                key={item.href}
                item={item}
                isActive={isNavItemActive(pathname, item.href)}
                onNavigate={onClose}
              />
            ))}
          </div>

          {ADMIN_NAV_GROUPS.map((group) => (
            <div key={group.heading} className="space-y-1">
              <p className="label px-3 text-wood-light">{group.heading}</p>
              {group.items.map((item) => (
                <NavLink
                  key={item.href}
                  item={item}
                  isActive={isNavItemActive(pathname, item.href)}
                  onNavigate={onClose}
                />
              ))}
            </div>
          ))}
        </nav>

        <div className="space-y-1 border-t border-ivory/10 px-4 py-4">
          {ADMIN_NAV_BOTTOM.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              isActive={isNavItemActive(pathname, item.href)}
              onNavigate={onClose}
            />
          ))}
        </div>
      </aside>
    </>
  )
}
