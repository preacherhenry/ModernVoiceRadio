"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import ArticleCard from "./ArticleCard";
import type { Article } from "@prisma/client";

export default function NewsExplorer({
  articles,
  categories,
}: {
  articles: Article[];
  categories: readonly string[];
}) {
  const [active, setActive] = useState<string>("All");

  const filtered = useMemo(
    () => (active === "All" ? articles : articles.filter((a) => a.category === active)),
    [active, articles]
  );

  return (
    <div>
      <div className="flex flex-wrap gap-2.5">
        {(["All", ...categories] as const).map((c) => (
          <button
            key={c}
            onClick={() => setActive(c)}
            className={cn(
              "border px-4 py-2 font-condensed text-xs font-semibold uppercase tracking-[0.14em] transition-colors",
              active === c
                ? "border-gold bg-gold text-ink"
                : "border-line-strong text-grey-300 hover:border-gold hover:text-gold"
            )}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="mt-8 flex flex-col">
        {filtered.map((a) => (
          <ArticleCard key={a.id} article={a} />
        ))}
        {filtered.length === 0 && (
          <p className="py-12 text-center text-sm text-grey-500">
            No stories in this category yet.
          </p>
        )}
      </div>
    </div>
  );
}
