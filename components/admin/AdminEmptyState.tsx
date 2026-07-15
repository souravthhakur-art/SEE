import type { LucideIcon } from "lucide-react"

interface AdminEmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
}

// Used by the stub pages for modules not in scope for Sprint 2 – Issue #3
// (Admin Shell). No mock data, no fake tables — an honest "not built yet"
// screen so the sidebar's links resolve to something real instead of a
// 404, without pretending a module exists before it does.
export function AdminEmptyState({ icon: Icon, title, description }: AdminEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-sm border border-dashed border-wood-light/50 px-6 py-24 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-ivory-dark text-wood">
        <Icon size={22} strokeWidth={1.5} aria-hidden="true" />
      </span>
      <h2 className="font-heading text-2xl text-charcoal mt-4">{title}</h2>
      <p className="mt-2 max-w-sm text-sm text-wood">{description}</p>
    </div>
  )
}
