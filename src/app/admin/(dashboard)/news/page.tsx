import Image from "next/image";
import Link from "next/link";
import { Pencil, Star } from "lucide-react";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import DeleteButton from "@/components/admin/DeleteButton";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";
import { deleteArticle } from "./actions";

export default async function AdminNewsPage() {
  const articles = await prisma.article.findMany({ orderBy: { date: "desc" } });

  return (
    <div>
      <AdminPageHeader eyebrow="Newsroom" title="News" newHref="/admin/news/new" newLabel="New Article" />

      <div className="mt-8 flex flex-col divide-y divide-line border border-line">
        {articles.length === 0 && <p className="p-6 text-sm text-grey-500">No articles yet.</p>}
        {articles.map((a) => (
          <div key={a.id} className="flex items-center gap-4 bg-ink-2 p-4">
            <div className="relative size-14 shrink-0 overflow-hidden">
              <Image src={a.image} alt={a.title} fill className="object-cover" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1.5 truncate text-sm font-semibold text-white">
                {a.featured && <Star className="size-3.5 shrink-0 fill-gold text-gold" />}
                {a.title}
              </p>
              <p className="truncate text-xs text-grey-500">
                {a.category} · {formatDate(a.date.toISOString())} · {a.author}
              </p>
            </div>
            <Link
              href={`/admin/news/${a.id}/edit`}
              className="flex items-center gap-1.5 border border-line-strong px-3 py-1.5 font-condensed text-xs font-semibold uppercase tracking-[0.08em] text-grey-300 transition-colors hover:border-gold hover:text-gold"
            >
              <Pencil className="size-3.5" />
              Edit
            </Link>
            <DeleteButton action={deleteArticle.bind(null, a.id)} />
          </div>
        ))}
      </div>
    </div>
  );
}
