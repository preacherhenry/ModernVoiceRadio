import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Article } from "@prisma/client";
import { formatDate } from "@/lib/format";

export default function FeaturedArticleCard({ article }: { article: Article }) {
  return (
    <Link href={`/news/${article.slug}`} className="group flex flex-col">
      <div className="relative h-72 overflow-hidden sm:h-96">
        <Image
          src={article.image}
          alt={article.title}
          fill
          priority
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/10 to-transparent" />
        <span className="absolute left-0 top-0 bg-red px-4 py-2 font-condensed text-xs font-bold uppercase tracking-[0.16em] text-white">
          Featured · {article.category}
        </span>
      </div>
      <div className="border border-t-0 border-line bg-ink-2 p-7 sm:p-8">
        <p className="font-condensed text-xs uppercase tracking-[0.14em] text-grey-500">
          {formatDate(article.date)} · By {article.author}
        </p>
        <h3 className="mt-3 font-display text-2xl font-extrabold leading-tight text-white transition-colors group-hover:text-gold sm:text-3xl">
          {article.title}
        </h3>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-grey-300">
          {article.excerpt}
        </p>
        <span className="mt-6 flex w-fit items-center gap-2 font-condensed text-sm font-bold uppercase tracking-[0.1em] text-gold">
          Read Full Story
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}
