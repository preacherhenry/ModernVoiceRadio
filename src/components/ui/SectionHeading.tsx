import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SectionHeading({
  index,
  eyebrow,
  title,
  description,
  link,
  light,
}: {
  index?: string;
  eyebrow: string;
  title: string;
  description?: string;
  link?: { href: string; label: string };
  light?: boolean;
}) {
  return (
    <div className="flex flex-col gap-6 border-b border-line pb-8 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        <div className="flex items-center gap-3">
          {index && (
            <span className="font-condensed text-sm font-semibold text-red">
              {index}
            </span>
          )}
          <span
            className={cn(
              "font-condensed text-sm font-semibold uppercase tracking-[0.22em]",
              light ? "text-ink-3" : "text-gold"
            )}
          >
            {eyebrow}
          </span>
        </div>
        <h2
          className={cn(
            "mt-3 text-3xl font-extrabold leading-[1.05] sm:text-4xl lg:text-[2.75rem]",
            light ? "text-ink" : "text-white"
          )}
        >
          {title}
        </h2>
        {description && (
          <p
            className={cn(
              "mt-4 max-w-xl text-base leading-relaxed",
              light ? "text-ink-3/70" : "text-grey-300"
            )}
          >
            {description}
          </p>
        )}
      </div>
      {link && (
        <Link
          href={link.href}
          className={cn(
            "group flex shrink-0 items-center gap-2 border px-5 py-2.5 font-condensed text-sm font-semibold uppercase tracking-[0.12em] transition-colors",
            light
              ? "border-ink/15 text-ink hover:border-ink hover:bg-ink hover:text-white"
              : "border-line-strong text-white hover:border-gold hover:text-gold"
          )}
        >
          {link.label}
          <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>
      )}
    </div>
  );
}
