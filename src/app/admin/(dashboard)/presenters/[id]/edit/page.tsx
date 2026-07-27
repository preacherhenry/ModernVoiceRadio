import { notFound } from "next/navigation";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { prisma } from "@/lib/prisma";
import PresenterForm from "../../PresenterForm";
import { updatePresenter } from "../../actions";

export default async function EditPresenterPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const presenter = await prisma.presenter.findUnique({ where: { id } });
  if (!presenter) notFound();

  return (
    <div>
      <AdminPageHeader eyebrow="Team" title={`Edit ${presenter.name}`} />
      <div className="mt-8 max-w-2xl border border-line bg-ink-2 p-6 sm:p-8">
        <PresenterForm action={updatePresenter.bind(null, presenter.id)} presenter={presenter} />
      </div>
    </div>
  );
}
