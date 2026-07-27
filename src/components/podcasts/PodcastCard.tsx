import Image from "next/image";
import Link from "next/link";
import { Play } from "lucide-react";
import type { Podcast } from "@prisma/client";
import { formatDate } from "@/lib/format";

export default function PodcastCard({ podcast }: { podcast: Podcast }) {
  return (
    <Link
      href={`/podcasts/${podcast.slug}`}
      className="group flex flex-col border border-line bg-ink-2 transition-colors hover:border-line-strong"
    >
      <div className="relative aspect-square overflow-hidden">
        <Image
          src={podcast.cover}
          alt={podcast.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-ink/25 transition-colors group-hover:bg-ink/10" />
        <span className="absolute flex size-14 items-center justify-center rounded-full bg-gold text-ink opacity-0 shadow-lg transition-opacity group-hover:opacity-100" style={{ top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}>
          <Play className="size-5 translate-x-0.5 fill-current" />
        </span>
        <span className="absolute bottom-3 left-3 bg-ink/80 px-2.5 py-1 font-condensed text-xs font-semibold text-white">
          {podcast.duration}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="font-condensed text-xs font-bold uppercase tracking-[0.14em] text-gold">
          {podcast.show} · Ep. {podcast.episode}
        </p>
        <h3 className="mt-2 line-clamp-2 font-display text-lg font-bold text-white">
          {podcast.title}
        </h3>
        <p className="mt-auto pt-3 font-condensed text-xs uppercase tracking-[0.1em] text-grey-500">
          {formatDate(podcast.date)}
        </p>
      </div>
    </Link>
  );
}
