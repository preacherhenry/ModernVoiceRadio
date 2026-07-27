"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import PodcastCard from "./PodcastCard";
import type { Podcast } from "@prisma/client";

export default function PodcastExplorer({ podcasts }: { podcasts: Podcast[] }) {
  const categories = useMemo(
    () => Array.from(new Set(podcasts.map((p) => p.category))),
    [podcasts]
  );
  const [active, setActive] = useState<string>("All");

  const filtered =
    active === "All" ? podcasts : podcasts.filter((p) => p.category === active);

  return (
    <div>
      <div className="flex flex-wrap gap-2.5">
        {["All", ...categories].map((c) => (
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

      <div className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
        {filtered.map((p) => (
          <PodcastCard key={p.id} podcast={p} />
        ))}
      </div>
    </div>
  );
}
