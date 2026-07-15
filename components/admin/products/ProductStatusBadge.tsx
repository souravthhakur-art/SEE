interface ProductStatusBadgeProps {
  status: "active" | "draft" | "archived"
}

const STATUS_STYLES: Record<ProductStatusBadgeProps["status"], string> = {
  active: "border-forest/20 bg-forest/10 text-forest",
  draft: "border-gold/30 bg-gold/10 text-walnut",
  archived: "border-charcoal/15 bg-charcoal/5 text-charcoal/70",
}

const STATUS_LABELS: Record<ProductStatusBadgeProps["status"], string> = {
  active: "Active",
  draft: "Draft",
  archived: "Archived",
}

export function ProductStatusBadge({ status }: ProductStatusBadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.16em] ${STATUS_STYLES[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  )
}
