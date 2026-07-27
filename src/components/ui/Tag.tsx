import { cn } from "@/lib/utils";

export default function Tag({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center border border-line-strong px-3 py-1 font-condensed text-xs font-semibold uppercase tracking-[0.14em] text-grey-300",
        className
      )}
    >
      {children}
    </span>
  );
}
