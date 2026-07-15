import {
  LayoutDashboard,
  ClipboardList,
  Package,
  Tag,
  Repeat,
  Users,
  BookOpen,
  Image as ImageIcon,
  Mail,
  BarChart3,
  Settings,
  Boxes,
  Warehouse,
  Truck,
  FileText,
  History,
  Calendar,
  type LucideIcon,
} from "lucide-react"

export interface AdminNavItem {
  label: string
  href: string
  icon: LucideIcon
}

interface AdminNavGroup {
  heading: string
  items: AdminNavItem[]
}

// Ungrouped, always rendered first — no section heading.
export const ADMIN_NAV_TOP: AdminNavItem[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
]

// Section order and grouping per Sprint 1.3 — nav sections match the
// admin module list exactly, requirement 6. Grouping is an IA decision,
// not a business one; revisit here (not in a business doc) if it
// changes.
export const ADMIN_NAV_GROUPS: AdminNavGroup[] = [
  {
    heading: "Commerce",
    items: [
      { label: "Orders", href: "/admin/orders", icon: ClipboardList },
      { label: "Products", href: "/admin/products", icon: Package },
      { label: "Categories & Collections", href: "/admin/categories", icon: Tag },
      { label: "Pantry Memberships", href: "/admin/subscriptions", icon: Repeat },
    ],
  },
  {
    heading: "Operations",
    items: [
      { label: "Inventory", href: "/admin/inventory", icon: Boxes },
      { label: "Warehouse", href: "/admin/warehouse", icon: Warehouse },
      { label: "Pantry Ops", href: "/admin/pantry-ops", icon: Calendar },
      { label: "Shipping Rules", href: "/admin/shipping", icon: Truck },
      { label: "Invoices", href: "/admin/invoices", icon: FileText },
      { label: "Audit Logs", href: "/admin/audit-logs", icon: History },
    ],
  },
  {
    heading: "People",
    items: [{ label: "Customers", href: "/admin/customers", icon: Users }],
  },
  {
    heading: "Content",
    items: [
      { label: "Journal", href: "/admin/journal", icon: BookOpen },
      { label: "Media Library", href: "/admin/media", icon: ImageIcon },
      { label: "Newsletter", href: "/admin/newsletter", icon: Mail },
    ],
  },
  {
    heading: "Insights",
    items: [{ label: "Analytics", href: "/admin/analytics", icon: BarChart3 }],
  },
]

// Pinned to the bottom of the sidebar, below the scrollable nav — not
// part of any section group (AdminBreadcrumbs treats bottom items as
// standalone crumbs for exactly this reason).
export const ADMIN_NAV_BOTTOM: AdminNavItem[] = [
  { label: "Settings", href: "/admin/settings", icon: Settings },
]

// Flat lookup table used by AdminBreadcrumbs to resolve a pathname to a
// label without caring which section it came from.
export const ADMIN_NAV_FLAT: AdminNavItem[] = [
  ...ADMIN_NAV_TOP,
  ...ADMIN_NAV_GROUPS.flatMap((group) => group.items),
  ...ADMIN_NAV_BOTTOM,
]

// Dashboard is exact-match only (every other route is a prefix of
// "/admin"). Everything else matches its own path or any nested path
// beneath it, so a future "/admin/products/[id]" still lights up
// "Products" in the sidebar.
export function isNavItemActive(pathname: string, href: string): boolean {
  if (href === "/admin") {
    return pathname === "/admin"
  }

  return pathname === href || pathname.startsWith(`${href}/`)
}
