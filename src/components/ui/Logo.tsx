import Image from "next/image";
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
      className={cn("group flex items-center", className)}
      aria-label="Modern Voice Radio 99.5 FM — home"
    >
      {markOnly ? (
        <span className="flex size-9 shrink-0 items-end justify-center gap-[3px] bg-blue p-2 sm:size-10">
          <span className="h-2 w-[3px] bg-gold transition-all duration-300 group-hover:h-3.5" />
          <span className="h-4 w-[3px] bg-white transition-all duration-300 group-hover:h-2.5" />
          <span className="h-2.5 w-[3px] bg-gold transition-all duration-300 group-hover:h-4" />
        </span>
      ) : (
        <Image
          src="/brand/logo-mark.png"
          alt="Modern Voice Radio 99.5 FM"
          width={645}
          height={304}
          priority
          className="h-11 w-auto sm:h-14"
        />
      )}
    </Link>
  );
}
