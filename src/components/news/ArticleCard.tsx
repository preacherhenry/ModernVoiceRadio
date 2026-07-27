import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Article } from "@prisma/client";
import { formatDate } from "@/lib/format";

export default function ArticleCard({ article }: { article: Article }) {
  return (
    <Link
      href={`/news/${article.slug}`}
      className="group flex gap-5 border-b border-line py-6 first:pt-0"
    >
      <div className="relative h-24 w-32 shrink-0 overflow-hidden sm:h-28 sm:w-40">
        <Image
          src={article.image}
          alt={article.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center gap-3">
          <span className="font-condensed text-xs font-bold uppercase tracking-[0.14em] text-red">
            {article.category}
          </span>
          <span className="font-condensed text-xs uppercase tracking-[0.1em] text-grey-500">
            {formatDate(article.date)}
          </span>
        </div>
        <h3 className="mt-2 line-clamp-2 font-display text-base font-bold text-white transition-colors group-hover:text-gold sm:text-lg">
          {article.title}
        </h3>
        <span className="mt-auto flex items-center gap-1.5 pt-2 font-condensed text-xs font-semibold uppercase tracking-[0.1em] text-grey-400 group-hover:text-white">
          Read Story
          <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}
