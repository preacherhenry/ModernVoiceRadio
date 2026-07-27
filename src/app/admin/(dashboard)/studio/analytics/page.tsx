import { Globe, Laptop, MapPin, MonitorSmartphone, Users } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getStreamStatus } from "@/lib/stream";

const ACTIVE_WINDOW_MS = 90 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

function msAgo(ms: number) {
  return new Date(Date.now() - ms);
}

async function topGroups(field: "country" | "city" | "device" | "os" | "browser", limit = 6) {
  const rows = await prisma.listenerSession.groupBy({
    by: [field],
    _count: { _all: true },
    where: { [field]: { not: null } },
    orderBy: { _count: { [field]: "desc" } },
    take: limit,
  });
  return rows.map((r) => ({ label: (r[field] as string | null) ?? "Unknown", count: r._count._all }));
}

function Breakdown({ title, icon: Icon, items }: { title: string; icon: typeof Globe; items: { label: string; count: number }[] }) {
  const max = Math.max(1, ...items.map((i) => i.count));
  return (
    <div className="border border-line bg-ink-2 p-5">
      <div className="mb-4 flex items-center gap-2 text-grey-400">
        <Icon className="size-4" />
        <p className="font-condensed text-xs font-semibold uppercase tracking-[0.14em]">{title}</p>
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-grey-500">Not enough data yet.</p>
      ) : (
        <div className="flex flex-col gap-2.5">
          {items.map((item) => (
            <div key={item.label}>
              <div className="flex items-center justify-between text-xs text-grey-300">
                <span className="truncate">{item.label}</span>
                <span className="tabular-nums text-grey-500">{item.count}</span>
              </div>
              <div className="mt-1 h-1.5 w-full bg-ink-4">
                <div className="h-full bg-gold" style={{ width: `${(item.count / max) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default async function StudioAnalyticsPage() {
  const cutoff = msAgo(ACTIVE_WINDOW_MS);

  const [streamStatus, activeVisitors, totalVisitors, avgSample, countries, cities, devices, os, browsers] =
    await Promise.all([
      getStreamStatus(),
      prisma.listenerSession.count({ where: { lastSeen: { gte: cutoff } } }),
      prisma.listenerSession.count(),
      prisma.listenerCountSample.aggregate({
        _avg: { count: true },
        where: { capturedAt: { gte: msAgo(DAY_MS) } },
      }),
      topGroups("country"),
      topGroups("city"),
      topGroups("device"),
      topGroups("os"),
      topGroups("browser"),
    ]);

  const stats = [
    { label: "Current Listeners (Stream)", value: streamStatus.listeners ?? "—" },
    { label: "Peak Listeners (Stream)", value: streamStatus.peakListeners ?? "—" },
    { label: "Average Listeners (24h, Website)", value: avgSample._avg.count ? Math.round(avgSample._avg.count) : "—" },
    { label: "Active Website Sessions", value: activeVisitors },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="border border-line bg-ink-2 p-5">
            <p className="font-display text-3xl font-extrabold text-gold">{s.value}</p>
            <p className="mt-1.5 font-condensed text-xs font-semibold uppercase tracking-[0.12em] text-grey-400">
              {s.label}
            </p>
          </div>
        ))}
      </div>

      <p className="text-xs text-grey-500">
        Stream listener counts come directly from Icecast (authoritative for all listeners, including
        outside apps). The breakdown below reflects the {totalVisitors} distinct visitor sessions tracked
        via the website player.
      </p>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Breakdown title="Countries" icon={Globe} items={countries} />
        <Breakdown title="Cities" icon={MapPin} items={cities} />
        <Breakdown title="Devices" icon={MonitorSmartphone} items={devices} />
        <Breakdown title="Operating Systems" icon={Laptop} items={os} />
        <Breakdown title="Browsers" icon={Users} items={browsers} />
      </div>
    </div>
  );
}
