import { Mail } from "lucide-react"
import { AdminEmptyState } from "@/components/admin/AdminEmptyState"

export default function AdminNewsletterPage() {
  return (
    <div className="space-y-8">
      <h1 className="heading-lg text-charcoal">Newsletter</h1>
      <AdminEmptyState
        icon={Mail}
        title="Newsletter isn't built yet"
        description="Coming in Sprint 4. Waits on a real newsletter backend — the current signup form on the site doesn't capture emails yet (see 06-progress.md)."
      />
    </div>
  )
}
