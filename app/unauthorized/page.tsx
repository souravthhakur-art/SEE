import Link from "next/link"
import { ShieldAlert } from "lucide-react"
import { AdminLogoutButton } from "@/components/admin/AdminLogoutButton"

// Deliberately outside app/admin — this page must never render inside
// AdminShell. A signed-in non-admin shouldn't see the admin sidebar or
// nav at all, not even on the page that tells them they can't use it.
export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-ivory px-6 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-ivory-dark text-wood">
        <ShieldAlert size={26} strokeWidth={1.5} aria-hidden="true" />
      </span>

      <h1 className="font-heading text-3xl text-charcoal mt-6">
        You don&apos;t have access to this page
      </h1>

      <p className="mt-2 max-w-sm text-sm text-wood">
        Your account is signed in, but it doesn&apos;t have admin permissions. If you
        believe this is a mistake, contact a Palum Dhara administrator.
      </p>

      <div className="mt-8 flex items-center gap-6">
        <Link href="/" className="btn-primary">
          Return to the website
        </Link>
        <AdminLogoutButton className="w-auto" />
      </div>
    </div>
  )
}
