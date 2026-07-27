import { requireUser } from "@/lib/auth/session";
import AdminShell from "@/components/admin/AdminShell";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();

  return <AdminShell user={user}>{children}</AdminShell>;
}
