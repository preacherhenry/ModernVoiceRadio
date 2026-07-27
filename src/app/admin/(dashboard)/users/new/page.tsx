import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { prisma } from "@/lib/prisma";
import UserForm from "../UserForm";

export default async function NewUserPage() {
  const presenters = await prisma.presenter.findMany({
    where: { user: null },
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <AdminPageHeader eyebrow="Access" title="New Staff Account" />
      <div className="mt-8 max-w-2xl border border-line bg-ink-2 p-6 sm:p-8">
        <UserForm presenters={presenters} />
      </div>
    </div>
  );
}
