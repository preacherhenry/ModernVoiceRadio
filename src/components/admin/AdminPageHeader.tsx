import Link from "next/link";
import { Plus } from "lucide-react";

export default function AdminPageHeader({
  eyebrow,
  title,
  newHref,
  newLabel,
}: {
  eyebrow: string;
  title: string;
  newHref?: string;
  newLabel?: string;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-6">
      <div>
        <p className="font-condensed text-sm font-semibold uppercase tracking-[0.22em] text-gold">
          {eyebrow}
        </p>
        <h1 className="mt-2 font-display text-3xl font-extrabold text-white">{title}</h1>
      </div>
      {newHref && newLabel && (
        <Link
          href={newHref}
          className="flex items-center gap-2 bg-red px-5 py-2.5 font-condensed text-sm font-bold uppercase tracking-[0.1em] text-white transition-colors hover:bg-red-dark"
        >
          <Plus className="size-4" />
          {newLabel}
        </Link>
      )}
    </div>
  );
}
