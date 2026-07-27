import Image from "next/image";
import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { Event as StationEvent } from "@prisma/client";
import { isLocalUpload } from "@/lib/image";

function dateParts(date: Date) {
  const d = new Date(date);
  return {
    day: d.toLocaleDateString("en-US", { day: "2-digit" }),
    month: d.toLocaleDateString("en-US", { month: "short" }).toUpperCase(),
  };
}

export default function EventCard({ event }: { event: StationEvent }) {
  const { day, month } = dateParts(event.date);

  return (
    <article className="group grid grid-cols-1 border border-line bg-ink-2 transition-colors hover:border-line-strong sm:grid-cols-[220px_1fr]">
      <div className="relative h-56 overflow-hidden sm:h-full">
        <Image
          src={event.image}
          alt={event.title}
          fill
          unoptimized={isLocalUpload(event.image)}
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute left-0 top-0 flex flex-col items-center bg-red px-4 py-2 text-white">
          <span className="font-display text-2xl font-extrabold leading-none">{day}</span>
          <span className="font-condensed text-xs font-bold uppercase tracking-[0.1em]">{month}</span>
        </div>
      </div>

      <div className="flex flex-col justify-center gap-3 p-6 sm:p-8">
        <p className="font-condensed text-xs font-semibold uppercase tracking-[0.14em] text-gold">
          {event.time}
        </p>
        <h3 className="font-display text-2xl font-bold text-white">{event.title}</h3>
        <p className="flex items-center gap-1.5 text-sm text-grey-400">
          <MapPin className="size-4 shrink-0" />
          {event.location}
        </p>
        <p className="text-sm leading-relaxed text-grey-300">{event.description}</p>
        <Button href="/contact" variant="gold" className="mt-2 w-fit">
          {event.ctaLabel}
        </Button>
      </div>
    </article>
  );
}
