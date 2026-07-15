import { BookOpen } from "lucide-react"
import { AdminEmptyState } from "@/components/admin/AdminEmptyState"

export default function AdminJournalPage() {
  return (
    <div className="space-y-8">
      <h1 className="heading-lg text-charcoal">Journal</h1>
      <AdminEmptyState
        icon={BookOpen}
        title="Journal isn't built yet"
        description="Coming in Sprint 4. A CMS-style editor for the journal articles that currently live hardcoded in lib/data.ts."
      />
    </div>
  )
}
