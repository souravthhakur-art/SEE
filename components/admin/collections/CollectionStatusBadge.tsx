interface CollectionStatusBadgeProps {
  active: boolean
}

export function CollectionStatusBadge({ active }: CollectionStatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.16em] ${
        active ? "border-forest/20 bg-forest/10 text-forest" : "border-charcoal/15 bg-charcoal/5 text-charcoal/70"
      }`}
    >
      {active ? "Active" : "Inactive"}
    </span>
  )
}
