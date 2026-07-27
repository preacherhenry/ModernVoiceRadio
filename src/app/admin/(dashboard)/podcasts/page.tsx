import Image from "next/image";
import Link from "next/link";
import { Pencil } from "lucide-react";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import DeleteButton from "@/components/admin/DeleteButton";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";
import { deletePodcast } from "./actions";

export default async function AdminPodcastsPage() {
  const podcasts = await prisma.podcast.findMany({ orderBy: { date: "desc" } });

  return (
    <div>
      <AdminPageHeader
        eyebrow="On Demand"
        title="Podcasts"
        newHref="/admin/podcasts/new"
        newLabel="New Episode"
      />

      <div className="mt-8 flex flex-col divide-y divide-line border border-line">
        {podcasts.length === 0 && <p className="p-6 text-sm text-grey-500">No episodes yet.</p>}
        {podcasts.map((p) => (
          <div key={p.id} className="flex items-center gap-4 bg-ink-2 p-4">
            <div className="relative size-14 shrink-0 overflow-hidden">
              <Image src={p.cover} alt={p.title} fill className="object-cover" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">{p.title}</p>
              <p className="truncate text-xs text-grey-500">
                {p.show} · Ep. {p.episode} · {formatDate(p.date.toISOString())}
              </p>
            </div>
            <Link
              href={`/admin/podcasts/${p.id}/edit`}
              className="flex items-center gap-1.5 border border-line-strong px-3 py-1.5 font-condensed text-xs font-semibold uppercase tracking-[0.08em] text-grey-300 transition-colors hover:border-gold hover:text-gold"
            >
              <Pencil className="size-3.5" />
              Edit
            </Link>
            <DeleteButton action={deletePodcast.bind(null, p.id)} />
          </div>
        ))}
      </div>
    </div>
  );
}
