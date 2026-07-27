"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  FileClock,
  LayoutDashboard,
  LogOut,
  Menu,
  Mic2,
  MessageSquare,
  Newspaper,
  Podcast,
  RadioTower,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";
import Logo from "@/components/ui/Logo";
import { cn } from "@/lib/utils";
import { logout } from "@/lib/auth/actions";
import type { SessionPayload } from "@/lib/auth/session";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/studio", label: "Broadcast Studio", icon: RadioTower },
  { href: "/admin/shows", label: "Shows", icon: Mic2 },
  { href: "/admin/presenters", label: "Presenters", icon: UserRound },
  { href: "/admin/news", label: "News", icon: Newspaper },
  { href: "/admin/podcasts", label: "Podcasts", icon: Podcast },
  { href: "/admin/events", label: "Events", icon: CalendarDays },
  { href: "/admin/requests", label: "Messages", icon: MessageSquare },
  { href: "/admin/users", label: "Users", icon: UsersRound, adminOnly: true },
  { href: "/admin/audit-log", label: "Audit Log", icon: FileClock, adminOnly: true },
];

function NavLinks({
  pathname,
  role,
  onNavigate,
}: {
  pathname: string;
  role: SessionPayload["role"];
  onNavigate?: () => void;
}) {
  return (
    <nav className="flex flex-col gap-1">
      {navItems
        .filter((item) => !item.adminOnly || role === "ADMIN")
        .map((item) => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 font-condensed text-sm font-semibold uppercase tracking-[0.08em] transition-colors",
                active
                  ? "bg-ink-3 text-white"
                  : "text-grey-400 hover:bg-ink-3/60 hover:text-white"
              )}
            >
              <Icon className="size-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
    </nav>
  );
}

export default function AdminShell({
  user,
  children,
}: {
  user: SessionPayload;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-ink text-white">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-line bg-ink-2 lg:flex">
        <div className="border-b border-line px-5 py-6">
          <Logo />
        </div>
        <div className="flex-1 overflow-y-auto py-5">
          <NavLinks pathname={pathname} role={user.role} />
        </div>
        <div className="border-t border-line p-4">
          <p className="truncate text-sm font-semibold text-white">{user.name}</p>
          <p className="truncate text-xs text-grey-500">{user.email}</p>
          <form action={logout}>
            <button
              type="submit"
              className="mt-3 flex w-full items-center gap-2 border border-line-strong px-3 py-2 font-condensed text-xs font-semibold uppercase tracking-[0.1em] text-grey-300 transition-colors hover:border-red hover:text-red"
            >
              <LogOut className="size-3.5" />
              Log Out
            </button>
          </form>
        </div>
      </aside>

      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-line bg-ink-2 px-4 py-3 lg:hidden">
        <Logo />
        <button
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
          className="flex size-10 items-center justify-center text-white"
        >
          {open ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </header>

      {open && (
        <div className="border-b border-line bg-ink-2 px-4 pb-4 lg:hidden">
          <NavLinks pathname={pathname} role={user.role} onNavigate={() => setOpen(false)} />
          <div className="mt-3 border-t border-line pt-4">
            <p className="truncate text-sm font-semibold text-white">{user.name}</p>
            <p className="truncate text-xs text-grey-500">{user.email}</p>
            <form action={logout}>
              <button
                type="submit"
                className="mt-3 flex w-full items-center gap-2 border border-line-strong px-3 py-2 font-condensed text-xs font-semibold uppercase tracking-[0.1em] text-grey-300"
              >
                <LogOut className="size-3.5" />
                Log Out
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="lg:pl-64">
        <main className="mx-auto max-w-6xl px-5 py-8 sm:px-8 lg:py-10">{children}</main>
      </div>
    </div>
  );
}
