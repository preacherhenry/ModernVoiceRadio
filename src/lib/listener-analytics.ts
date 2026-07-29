import "server-only";
import { prisma } from "./prisma";

export const ACTIVE_WINDOW_MS = 90 * 1000;

export function msAgo(ms: number) {
  return new Date(Date.now() - ms);
}

function dateKeyUTC(d: Date) {
  return d.toISOString().slice(0, 10);
}

export function startOfUTCDay(d: Date) {
  const out = new Date(d);
  out.setUTCHours(0, 0, 0, 0);
  return out;
}

export function lastNDaysStart(days: number) {
  const start = startOfUTCDay(new Date());
  start.setUTCDate(start.getUTCDate() - (days - 1));
  return start;
}

export type DailyStat = { date: string; peak: number; average: number };

/** Website-only listener counts (never Icecast's whole-stream figure), bucketed
 * per calendar day from the periodic ListenerCountSample rows. Days with no
 * recorded samples show as zero rather than being omitted, so charts/tables
 * always have one entry per day in range. */
export async function dailyListenerStats(since: Date, days: number): Promise<DailyStat[]> {
  const samples = await prisma.listenerCountSample.findMany({
    where: { capturedAt: { gte: since } },
    select: { count: true, capturedAt: true },
    orderBy: { capturedAt: "asc" },
  });

  const byDay = new Map<string, number[]>();
  for (const s of samples) {
    const key = dateKeyUTC(s.capturedAt);
    if (!byDay.has(key)) byDay.set(key, []);
    byDay.get(key)!.push(s.count);
  }

  const result: DailyStat[] = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(since);
    d.setUTCDate(since.getUTCDate() + i);
    const key = dateKeyUTC(d);
    const values = byDay.get(key) ?? [];
    const peak = values.length ? Math.max(...values) : 0;
    const average = values.length ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : 0;
    result.push({ date: key, peak, average });
  }
  return result;
}

type GroupField = "country" | "city" | "device" | "os" | "browser";

/** Breakdown of listeners currently active on the website right now (not
 * all-time visitor history), so every dimension sums to the same live total. */
export async function activeGroups(field: GroupField, limit = 8) {
  const cutoff = msAgo(ACTIVE_WINDOW_MS);
  const rows = await prisma.listenerSession.groupBy({
    by: [field],
    _count: { _all: true },
    where: { [field]: { not: null }, lastSeen: { gte: cutoff } },
    orderBy: { _count: { [field]: "desc" } },
    take: limit,
  });
  return rows.map((r) => ({ label: (r[field] as string | null) ?? "Unknown", count: r._count._all }));
}
