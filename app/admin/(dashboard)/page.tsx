import { ClipboardList, AlertTriangle, Repeat, Mail, FileEdit } from "lucide-react"
import { getCurrentSession } from "@/lib/session"
import { MetricCard } from "@/components/admin/MetricCard"

// Widget set and order follows 09-admin-blueprint.md -> Dashboard, which
// itself flags the final widget set/priority as an open decision. These
// are placeholder cards only — no data source is wired up in this
// ticket (Sprint 2 – Issue #3: Admin Shell). Values are static "—" until
// Orders, Inventory, Subscriptions, Newsletter, and Products each have a
// real data source to report from.
const METRICS = [
  {
    title: "Orders awaiting confirmation",
    value: "—",
    hint: "Connects once the Order model ships",
    icon: ClipboardList,
  },
  {
    title: "Low-stock alerts",
    value: "—",
    hint: "Connects once inventory tracking ships",
    icon: AlertTriangle,
  },
  {
    title: "New subscription sign-ups",
    value: "—",
    hint: "Connects once subscriptions are tracked",
    icon: Repeat,
  },
  {
    title: "New newsletter sign-ups",
    value: "—",
    hint: "Connects once a newsletter backend ships",
    icon: Mail,
  },
  {
    title: "Draft products",
    value: "—",
    hint: "Connects once the Products module ships",
    icon: FileEdit,
  },
]

export default async function AdminDashboardPage() {
  const session = await getCurrentSession()
  const name = session?.user.name ?? "there"

  return (
    <div className="space-y-8">
      <div>
        <h1 className="heading-lg text-charcoal">Dashboard</h1>
        <p className="mt-1 text-wood">Welcome back, {name}.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {METRICS.map((metric) => (
          <MetricCard key={metric.title} {...metric} />
        ))}
      </div>
    </div>
  )
}
