import { notFound } from "next/navigation";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { prisma } from "@/lib/prisma";
import ShowForm from "../../ShowForm";
import { updateShow } from "../../actions";

export default async function EditShowPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [show, presenters] = await Promise.all([
    prisma.show.findUnique({ where: { id } }),
    prisma.presenter.findMany({ orderBy: { name: "asc" } }),
  ]);
  if (!show) notFound();

  return (
    <div>
      <AdminPageHeader eyebrow="Schedule" title={`Edit ${show.name}`} />
      <div className="mt-8 max-w-2xl border border-line bg-ink-2 p-6 sm:p-8">
        <ShowForm action={updateShow.bind(null, show.id)} show={show} presenters={presenters} />
      </div>
    </div>
  );
}
