import { requireAdminSession } from "@/lib/session";
import { AdminShell } from "@/components/admin/AdminShell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdminSession();

  return <AdminShell>{children}</AdminShell>;
}
