import Link from "next/link";
import { cn } from "@/lib/utils";

type Common = {
  children: React.ReactNode;
  className?: string;
  variant?: "primary" | "outline" | "ghost" | "gold";
  icon?: React.ReactNode;
};

const base =
  "inline-flex items-center justify-center gap-2.5 px-6 py-3.5 font-condensed text-sm font-bold uppercase tracking-[0.12em] transition-colors duration-200";

const variants = {
  primary: "bg-red text-white hover:bg-red-dark",
  gold: "bg-gold text-ink hover:bg-gold-soft",
  outline:
    "border border-line-strong text-white hover:border-gold hover:text-gold",
  ghost: "text-white hover:text-gold",
};

export function Button({
  children,
  className,
  variant = "primary",
  icon,
  href,
  ...rest
}: Common & { href?: string } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const classes = cn(base, variants[variant], className);

  if (href) {
    return (
      <Link href={href} className={classes}>
        {icon}
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...rest}>
      {icon}
      {children}
    </button>
  );
}
