import Image from "next/image";
import Link from "next/link";
import { Pencil } from "lucide-react";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import DeleteButton from "@/components/admin/DeleteButton";
import { prisma } from "@/lib/prisma";
import { isLocalUpload } from "@/lib/image";
import { deleteShow } from "./actions";

export default async function AdminShowsPage() {
  const shows = await prisma.show.findMany({
    orderBy: { order: "asc" },
    include: { host: true },
  });

  return (
    <div>
      <AdminPageHeader eyebrow="Schedule" title="Shows" newHref="/admin/shows/new" newLabel="New Show" />

      <div className="mt-8 flex flex-col divide-y divide-line border border-line">
        {shows.length === 0 && <p className="p-6 text-sm text-grey-500">No shows yet.</p>}
        {shows.map((s) => (
          <div key={s.id} className="flex items-center gap-4 bg-ink-2 p-4">
            <div className="relative size-14 shrink-0 overflow-hidden">
              <Image src={s.image} alt={s.name} fill unoptimized={isLocalUpload(s.image)} className="object-cover" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">{s.name}</p>
              <p className="truncate text-xs text-grey-500">
                {s.time} · {s.days} · {s.host?.name ?? "No host"}
              </p>
            </div>
            <Link
              href={`/admin/shows/${s.id}/edit`}
              className="flex items-center gap-1.5 border border-line-strong px-3 py-1.5 font-condensed text-xs font-semibold uppercase tracking-[0.08em] text-grey-300 transition-colors hover:border-gold hover:text-gold"
            >
              <Pencil className="size-3.5" />
              Edit
            </Link>
            <DeleteButton action={deleteShow.bind(null, s.id)} />
          </div>
        ))}
      </div>
    </div>
  );
}
