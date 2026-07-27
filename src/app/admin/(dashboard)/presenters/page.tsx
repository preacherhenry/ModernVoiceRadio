import Image from "next/image";
import Link from "next/link";
import { Pencil } from "lucide-react";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import DeleteButton from "@/components/admin/DeleteButton";
import { prisma } from "@/lib/prisma";
import { deletePresenter } from "./actions";

export default async function AdminPresentersPage() {
  const presenters = await prisma.presenter.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <AdminPageHeader
        eyebrow="Team"
        title="Presenters"
        newHref="/admin/presenters/new"
        newLabel="New Presenter"
      />

      <div className="mt-8 flex flex-col divide-y divide-line border border-line">
        {presenters.length === 0 && (
          <p className="p-6 text-sm text-grey-500">No presenters yet.</p>
        )}
        {presenters.map((p) => (
          <div key={p.id} className="flex items-center gap-4 bg-ink-2 p-4">
            <div className="relative size-14 shrink-0 overflow-hidden">
              <Image src={p.image} alt={p.name} fill className="object-cover" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">
                {p.name}
                {p.aka && <span className="text-grey-500"> · &ldquo;{p.aka}&rdquo;</span>}
              </p>
              <p className="truncate text-xs text-grey-500">{p.role}</p>
            </div>
            <Link
              href={`/admin/presenters/${p.id}/edit`}
              className="flex items-center gap-1.5 border border-line-strong px-3 py-1.5 font-condensed text-xs font-semibold uppercase tracking-[0.08em] text-grey-300 transition-colors hover:border-gold hover:text-gold"
            >
              <Pencil className="size-3.5" />
              Edit
            </Link>
            <DeleteButton action={deletePresenter.bind(null, p.id)} label="Delete" />
          </div>
        ))}
      </div>
    </div>
  );
}
