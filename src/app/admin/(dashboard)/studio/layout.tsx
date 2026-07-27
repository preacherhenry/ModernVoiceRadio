import { requireBroadcaster } from "@/lib/auth/session";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import StudioTabs from "@/components/admin/StudioTabs";

export default async function StudioLayout({ children }: { children: React.ReactNode }) {
  const session = await requireBroadcaster();

  return (
    <div>
      <AdminPageHeader eyebrow="On Air" title="Broadcast Studio" />
      <div className="mt-6">
        <StudioTabs isAdmin={session.role === "ADMIN"} />
        <div className="pt-8">{children}</div>
      </div>
    </div>
  );
}
