import { Download, Globe, Laptop, MapPin, MonitorSmartphone, Users } from "lucide-react";
import { prisma } from "@/lib/prisma";
import {
  ACTIVE_WINDOW_MS,
  msAgo,
  startOfUTCDay,
  lastNDaysStart,
  dailyListenerStats,
  activeGroups,
} from "@/lib/listener-analytics";

function Breakdown({
  title,
  icon: Icon,
  items,
}: {
  title: string;
  icon: typeof Globe;
  items: { label: string; count: number }[];
}) {
  const max = Math.max(1, ...items.map((i) => i.count));
  return (
    <div className="border border-line bg-ink-2 p-5">
      <div className="mb-4 flex items-center gap-2 text-grey-400">
        <Icon className="size-4" />
        <p className="font-condensed text-xs font-semibold uppercase tracking-[0.14em]">{title}</p>
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-grey-500">No one on the website right now.</p>
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

const weekdayFormatter = new Intl.DateTimeFormat("en-US", { weekday: "short", timeZone: "UTC" });

export default async function StudioAnalyticsPage() {
  const cutoff = msAgo(ACTIVE_WINDOW_MS);
  const startOfToday = startOfUTCDay(new Date());

  const [activeVisitors, todaySamples, weekly, cities, countries, devices, os, browsers] = await Promise.all([
    prisma.listenerSession.count({ where: { lastSeen: { gte: cutoff } } }),
    prisma.listenerCountSample.findMany({
      where: { capturedAt: { gte: startOfToday } },
      select: { count: true },
    }),
    dailyListenerStats(lastNDaysStart(7), 7),
    activeGroups("city"),
    activeGroups("country"),
    activeGroups("device"),
    activeGroups("os"),
    activeGroups("browser"),
  ]);

  const peakToday = todaySamples.length ? Math.max(...todaySamples.map((s) => s.count)) : 0;
  const avgToday = todaySamples.length
    ? Math.round(todaySamples.reduce((a, b) => a + b.count, 0) / todaySamples.length)
    : 0;

  const stats = [
    { label: "Listening Now (Website)", value: activeVisitors },
    { label: "Peak Today (Website)", value: peakToday },
    { label: "Average Today (Website)", value: avgToday },
  ];

  const chartMax = Math.max(1, ...weekly.map((d) => d.peak));

  return (
    <div className="flex flex-col gap-8">
      <p className="text-xs text-grey-500">
        Everything on this page reflects listeners tracked through this website only (Icecast&apos;s whole-stream
        count, which also includes outside apps and other players, is shown elsewhere on the Studio
        dashboard).
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="border border-line bg-ink-2 p-5">
            <p className="font-display text-3xl font-extrabold text-gold">{s.value}</p>
            <p className="mt-1.5 font-condensed text-xs font-semibold uppercase tracking-[0.12em] text-grey-400">
              {s.label}
            </p>
          </div>
        ))}
      </div>

      <div className="border border-line bg-ink-2 p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-grey-400">
            <MapPin className="size-4" />
            <p className="font-condensed text-xs font-semibold uppercase tracking-[0.14em]">
              Current Streaming Locations
            </p>
          </div>
          <p className="font-display text-2xl font-extrabold text-gold">
            {activeVisitors} <span className="text-sm font-semibold text-grey-500">total</span>
          </p>
        </div>
        {cities.length === 0 ? (
          <p className="mt-4 text-sm text-grey-500">No one on the website right now.</p>
        ) : (
          <div className="mt-4 flex flex-col gap-2.5">
            {cities.map((c) => (
              <div key={c.label} className="flex items-center justify-between text-sm">
                <span className="text-grey-200">{c.label}</span>
                <span className="tabular-nums text-grey-400">{c.count}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="border border-line bg-ink-2 p-5">
        <div className="flex items-center justify-between">
          <p className="font-condensed text-xs font-semibold uppercase tracking-[0.14em] text-grey-400">
            Peak Website Listeners — Last 7 Days
          </p>
          <a
            href="/api/studio/analytics/report"
            className="flex items-center gap-2 font-condensed text-xs font-semibold uppercase tracking-[0.1em] text-gold hover:text-gold-soft"
          >
            <Download className="size-3.5" />
            Download Monthly Report
          </a>
        </div>
        <div className="mt-6 flex h-40 items-end gap-3 sm:gap-5">
          {weekly.map((d) => (
            <div key={d.date} className="flex flex-1 flex-col items-center gap-2">
              <span className="font-condensed text-xs font-semibold tabular-nums text-grey-300">{d.peak}</span>
              <div className="flex h-28 w-full items-end bg-ink-4">
                <div
                  className="w-full bg-gold"
                  style={{ height: `${Math.max(2, (d.peak / chartMax) * 100)}%` }}
                />
              </div>
              <span className="font-condensed text-[10px] font-semibold uppercase tracking-[0.1em] text-grey-500">
                {weekdayFormatter.format(new Date(`${d.date}T00:00:00Z`))}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Breakdown title="Countries" icon={Globe} items={countries} />
        <Breakdown title="Devices" icon={MonitorSmartphone} items={devices} />
        <Breakdown title="Operating Systems" icon={Laptop} items={os} />
        <Breakdown title="Browsers" icon={Users} items={browsers} />
      </div>
    </div>
  );
}
