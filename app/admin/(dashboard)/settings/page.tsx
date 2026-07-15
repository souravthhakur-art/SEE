import { Settings } from "lucide-react"
import { AdminEmptyState } from "@/components/admin/AdminEmptyState"

export default function AdminSettingsPage() {
  return (
    <div className="space-y-8">
      <h1 className="heading-lg text-charcoal">Settings</h1>
      <AdminEmptyState
        icon={Settings}
        title="Settings isn't built yet"
        description="Coming in Sprint 5. Site-wide configuration, starting with the WhatsApp business number and free-delivery threshold documented in 07-commerce-rules.md."
      />
    </div>
  )
}
