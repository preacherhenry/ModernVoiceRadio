"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/admin/studio", label: "Studio", exact: true },
  { href: "/admin/studio/chat", label: "Chat" },
  { href: "/admin/studio/schedule", label: "Schedule" },
  { href: "/admin/studio/analytics", label: "Analytics" },
  { href: "/admin/studio/history", label: "History" },
  { href: "/admin/studio/emergency", label: "Emergency", adminOnly: true },
];

export default function StudioTabs({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();

  return (
    <div className="flex flex-wrap gap-1 border-b border-line">
      {tabs
        .filter((t) => !t.adminOnly || isAdmin)
        .map((tab) => {
          const active = tab.exact ? pathname === tab.href : pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "border-b-2 px-4 py-3 font-condensed text-sm font-semibold uppercase tracking-[0.1em] transition-colors",
                tab.adminOnly && "text-red-bright",
                active
                  ? tab.adminOnly
                    ? "border-red text-red-bright"
                    : "border-gold text-white"
                  : "border-transparent text-grey-400 hover:text-white"
              )}
            >
              {tab.label}
            </Link>
          );
        })}
    </div>
  );
}
