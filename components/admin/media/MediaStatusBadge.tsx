interface MediaStatusBadgeProps {
  usageCount: number
}

export function MediaStatusBadge({ usageCount }: MediaStatusBadgeProps) {
  const inUse = usageCount > 0

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.16em] ${
        inUse ? "border-forest/20 bg-forest/10 text-forest" : "border-charcoal/15 bg-charcoal/5 text-charcoal/70"
      }`}
    >
      {inUse ? `In use · ${usageCount}` : "Unused"}
    </span>
  )
}
