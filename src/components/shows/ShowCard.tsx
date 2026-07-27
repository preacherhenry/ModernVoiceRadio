import Image from "next/image";
import Link from "next/link";
import { Clock } from "lucide-react";
import type { Show, Presenter } from "@prisma/client";

export default function ShowCard({ show }: { show: Show & { host: Presenter | null } }) {
  const host = show.host;

  return (
    <article className="group flex flex-col border border-line bg-ink-2 transition-colors hover:border-line-strong">
      <div className="relative h-52 overflow-hidden">
        <Image
          src={show.image}
          alt={show.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-2 via-ink-2/10 to-transparent" />
        <span className="absolute left-4 top-4 bg-red px-3 py-1 font-condensed text-xs font-bold uppercase tracking-[0.14em] text-white">
          {show.tag}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-center gap-2 font-condensed text-sm font-semibold uppercase tracking-[0.1em] text-gold">
          <Clock className="size-3.5" />
          {show.time}
        </div>
        <p className="mt-1 font-condensed text-xs uppercase tracking-[0.14em] text-grey-500">
          {show.days}
        </p>

        <h3 className="mt-3 font-display text-2xl font-bold text-white">
          {show.name}
        </h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-grey-300">
          {show.description}
        </p>

        {host && (
          <Link
            href="/presenters"
            className="mt-5 flex items-center gap-3 border-t border-line pt-4"
          >
            <span className="relative size-9 shrink-0 overflow-hidden rounded-full">
              <Image src={host.image} alt={host.name} fill className="object-cover" />
            </span>
            <span className="text-sm">
              <span className="block text-grey-500">Hosted by</span>
              <span className="font-semibold text-white">{host.name}</span>
            </span>
          </Link>
        )}
      </div>
    </article>
  );
}
