import Link from "next/link";
import { CalendarDays, MessageSquare, Mic2, Newspaper, Podcast, UserRound } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";

export default async function AdminDashboardPage() {
  const [showCount, presenterCount, articleCount, podcastCount, eventCount, newMessages, recentMessages] =
    await Promise.all([
      prisma.show.count(),
      prisma.presenter.count(),
      prisma.article.count(),
      prisma.podcast.count(),
      prisma.event.count(),
      prisma.listenerMessage.count({ where: { status: "NEW" } }),
      prisma.listenerMessage.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
    ]);

  const stats = [
    { label: "Shows", value: showCount, href: "/admin/shows", icon: Mic2 },
    { label: "Presenters", value: presenterCount, href: "/admin/presenters", icon: UserRound },
    { label: "News Articles", value: articleCount, href: "/admin/news", icon: Newspaper },
    { label: "Podcast Episodes", value: podcastCount, href: "/admin/podcasts", icon: Podcast },
    { label: "Events", value: eventCount, href: "/admin/events", icon: CalendarDays },
    { label: "New Messages", value: newMessages, href: "/admin/requests", icon: MessageSquare },
  ];

  return (
    <div>
      <p className="font-condensed text-sm font-semibold uppercase tracking-[0.22em] text-gold">
        Overview
      </p>
      <h1 className="mt-2 font-display text-3xl font-extrabold text-white">Dashboard</h1>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="flex items-center gap-4 border border-line bg-ink-2 p-5 transition-colors hover:border-line-strong"
          >
            <span className="flex size-11 shrink-0 items-center justify-center bg-red/10 text-red">
              <s.icon className="size-5" />
            </span>
            <div>
              <p className="font-display text-2xl font-extrabold text-white">{s.value}</p>
              <p className="font-condensed text-xs font-semibold uppercase tracking-[0.12em] text-grey-400">
                {s.label}
              </p>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-10">
        <div className="flex items-center justify-between border-b border-line pb-4">
          <h2 className="font-display text-xl font-bold text-white">Recent Messages</h2>
          <Link
            href="/admin/requests"
            className="font-condensed text-xs font-semibold uppercase tracking-[0.1em] text-gold hover:text-gold-soft"
          >
            View All
          </Link>
        </div>

        {recentMessages.length === 0 ? (
          <p className="py-8 text-sm text-grey-500">No messages submitted yet.</p>
        ) : (
          <div className="mt-4 flex flex-col">
            {recentMessages.map((m) => (
              <div key={m.id} className="flex flex-col gap-1 border-b border-line py-4 last:border-none">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm font-semibold text-white">{m.name}</p>
                  <span className="shrink-0 font-condensed text-xs uppercase tracking-[0.1em] text-grey-500">
                    {formatDate(m.createdAt.toISOString())}
                  </span>
                </div>
                {m.song && <p className="text-sm text-gold">🎵 {m.song}</p>}
                {m.message && <p className="text-sm text-grey-400">{m.message}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
