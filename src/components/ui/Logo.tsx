import Link from "next/link";
import { cn } from "@/lib/utils";

export default function Logo({
  className,
  markOnly,
}: {
  className?: string;
  markOnly?: boolean;
}) {
  return (
    <Link
      href="/"
      className={cn("group flex items-center gap-3", className)}
      aria-label="Modern Voice Radio 99.5 FM — home"
    >
      <span className="flex size-9 shrink-0 items-end justify-center gap-[3px] bg-red p-2 sm:size-10">
        <span className="h-2 w-[3px] bg-gold transition-all duration-300 group-hover:h-3.5" />
        <span className="h-4 w-[3px] bg-white transition-all duration-300 group-hover:h-2.5" />
        <span className="h-2.5 w-[3px] bg-gold transition-all duration-300 group-hover:h-4" />
      </span>
      {!markOnly && (
        <span className="flex flex-col leading-none">
          <span className="font-display text-lg font-extrabold tracking-tight text-white sm:text-xl">
            MODERN VOICE
          </span>
          <span className="font-condensed text-[11px] font-semibold uppercase tracking-[0.3em] text-gold">
            Radio · 99.5 FM
          </span>
        </span>
      )}
    </Link>
  );
}
