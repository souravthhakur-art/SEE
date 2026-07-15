"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRight } from "lucide-react"
import { ADMIN_NAV_GROUPS, ADMIN_NAV_FLAT } from "@/lib/admin/nav-config"

interface Crumb {
  label: string
  href: string
}

function humanizeSegment(segment: string) {
  if (segment === "new") return "New"
  if (segment === "edit") return "Edit"

  return decodeURIComponent(segment)
    .replace(/-/g, " ")
    .replace(/\b\w/g, (match) => match.toUpperCase())
}

function buildTrail(pathname: string): Crumb[] {
  if (pathname === "/admin") {
    return [{ label: "Dashboard", href: "/admin" }]
  }

  const directMatch = ADMIN_NAV_FLAT.find((item) => item.href === pathname)

  if (directMatch) {
    const parentGroup = ADMIN_NAV_GROUPS.find((group) => group.items.some((item) => item.href === directMatch.href))

    if (!parentGroup) {
      return [{ label: directMatch.label, href: directMatch.href }]
    }

  return [
  { label: "Dashboard", href: "/admin" },
  { label: directMatch.label, href: directMatch.href },
]
  }

  const baseMatch = [...ADMIN_NAV_FLAT]
    .sort((left, right) => right.href.length - left.href.length)
    .find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`))

  if (!baseMatch) {
    return [{ label: "Dashboard", href: "/admin" }]
  }

  const baseTrail = buildTrail(baseMatch.href)
  const remainder = pathname.slice(baseMatch.href.length).split("/").filter(Boolean)

  let currentHref = baseMatch.href
  const extraCrumbs = remainder.map((segment) => {
    currentHref = `${currentHref}/${segment}`

    return {
      label: humanizeSegment(segment),
      href: currentHref,
    }
  })

  return [...baseTrail, ...extraCrumbs]
}

export function AdminBreadcrumbs() {
  const pathname = usePathname()
  const trail = buildTrail(pathname)

  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex items-center gap-2 font-body text-sm">
        {trail.map((crumb, index) => {
          const isLast = index === trail.length - 1

          return (
            <li key={crumb.href} className="flex items-center gap-2">
              {index > 0 ? <ChevronRight size={14} className="text-wood-light" aria-hidden="true" /> : null}
              {isLast ? (
                <span className="font-medium text-charcoal" aria-current="page">
                  {crumb.label}
                </span>
              ) : (
                <Link href={crumb.href} className="text-wood hover:text-charcoal">
                  {crumb.label}
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
