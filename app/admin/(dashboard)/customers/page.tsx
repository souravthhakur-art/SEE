import { Users } from "lucide-react"
import { AdminEmptyState } from "@/components/admin/AdminEmptyState"

export default function AdminCustomersPage() {
  return (
    <div className="space-y-8">
      <h1 className="heading-lg text-charcoal">Customers</h1>
      <AdminEmptyState
        icon={Users}
        title="Customers isn't built yet"
        description="Coming in Sprint 3. Customer activity is mostly order history, so this module waits on the Order model landing first (00-decision-log.md DEC-007)."
      />
    </div>
  )
}
