import Link from "next/link";
import { Clock, Radio } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { daysStringIncludesToday } from "@/lib/schedule";

export default async function StudioSchedulePage() {
  const shows = await prisma.show.findMany({ orderBy: { order: "asc" }, include: { host: true } });
  const today = shows.filter((s) => daysStringIncludesToday(s.days));
  const upcoming = shows.filter((s) => !daysStringIncludesToday(s.days));
  const todayName = new Date().toLocaleDateString("en-US", { weekday: "long" });

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h2 className="font-display text-lg font-bold text-white">Today — {todayName}</h2>
        <div className="mt-4 flex flex-col divide-y divide-line border border-line">
          {today.length === 0 && (
            <p className="p-6 text-sm text-grey-500">No shows scheduled for today.</p>
          )}
          {today.map((show) => (
            <div key={show.id} className="flex flex-col gap-3 bg-ink-2 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-white">{show.name}</p>
                <p className="flex items-center gap-1.5 text-xs text-grey-500">
                  <Clock className="size-3.5" />
                  {show.time}
                  {show.host && <span> · {show.host.name}</span>}
                </p>
              </div>
              <Link
                href={`/admin/studio?programName=${encodeURIComponent(show.name)}${
                  show.hostId ? `&presenterId=${show.hostId}` : ""
                }&category=${encodeURIComponent(show.tag)}`}
                className="flex w-fit items-center gap-2 bg-red px-4 py-2.5 font-condensed text-xs font-bold uppercase tracking-[0.1em] text-white transition-colors hover:bg-red-dark"
              >
                <Radio className="size-3.5" />
                Start This Show
              </Link>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="font-display text-lg font-bold text-white">Upcoming Programs</h2>
        <div className="mt-4 flex flex-col divide-y divide-line border border-line">
          {upcoming.length === 0 && (
            <p className="p-6 text-sm text-grey-500">No other shows in the schedule.</p>
          )}
          {upcoming.map((show) => (
            <div key={show.id} className="flex items-center justify-between gap-4 bg-ink-2 p-5">
              <div>
                <p className="text-sm font-semibold text-white">{show.name}</p>
                <p className="text-xs text-grey-500">
                  {show.days} · {show.time}
                  {show.host && <span> · {show.host.name}</span>}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
