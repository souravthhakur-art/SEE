import { BarChart3 } from "lucide-react"
import { AdminEmptyState } from "@/components/admin/AdminEmptyState"

export default function AdminAnalyticsPage() {
  return (
    <div className="space-y-8">
      <h1 className="heading-lg text-charcoal">Analytics</h1>
      <AdminEmptyState
        icon={BarChart3}
        title="Analytics isn't built yet"
        description="Coming in Sprint 5. Store-wide metrics, once Orders and Products have real data to report on — no numbers here until there's something real to count."
      />
    </div>
  )
}
