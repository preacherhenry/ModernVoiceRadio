import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { prisma } from "@/lib/prisma";
import ShowForm from "../ShowForm";
import { createShow } from "../actions";

export default async function NewShowPage() {
  const presenters = await prisma.presenter.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <AdminPageHeader eyebrow="Schedule" title="New Show" />
      <div className="mt-8 max-w-2xl border border-line bg-ink-2 p-6 sm:p-8">
        <ShowForm action={createShow} presenters={presenters} />
      </div>
    </div>
  );
}
