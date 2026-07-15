import type { LucideIcon } from "lucide-react"

interface MetricCardProps {
  title: string
  value: string
  hint: string
  icon: LucideIcon
}

export function MetricCard({ title, value, hint, icon: Icon }: MetricCardProps) {
  return (
    <div className="rounded-sm border border-wood-light/40 bg-ivory p-6">
      <div className="flex items-start justify-between">
        <p className="label text-wood">{title}</p>
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-ivory-dark text-wood">
          <Icon size={18} strokeWidth={1.75} aria-hidden="true" />
        </span>
      </div>
      <p className="font-heading text-4xl text-charcoal mt-4">{value}</p>
      <p className="mt-2 text-sm text-wood">{hint}</p>
    </div>
  )
}
