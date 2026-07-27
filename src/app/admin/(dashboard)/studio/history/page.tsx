import { Download, TriangleAlert } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";

function formatDuration(seconds: number | null) {
  if (!seconds) return "—";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export default async function StudioHistoryPage() {
  const sessions = await prisma.broadcastSession.findMany({
    where: { status: { in: ["ENDED", "ERROR"] } },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { hostUser: { select: { name: true } }, presenter: { select: { name: true } }, recording: true },
  });

  return (
    <div className="flex flex-col divide-y divide-line border border-line">
      {sessions.length === 0 && (
        <p className="p-6 text-sm text-grey-500">No previous broadcasts yet.</p>
      )}
      {sessions.map((session) => (
        <div key={session.id} className="flex flex-col gap-3 bg-ink-2 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-semibold text-white">{session.programName}</p>
              {session.isEmergency && (
                <span className="flex items-center gap-1 border border-red px-2 py-0.5 font-condensed text-[10px] font-bold uppercase tracking-[0.1em] text-red-bright">
                  <TriangleAlert className="size-3" />
                  Emergency
                </span>
              )}
              {session.status === "ERROR" && (
                <span className="border border-grey-600 px-2 py-0.5 font-condensed text-[10px] font-bold uppercase tracking-[0.1em] text-grey-500">
                  Failed
                </span>
              )}
            </div>
            <p className="mt-1 text-xs text-grey-500">
              {formatDate(session.createdAt.toISOString())} · {session.presenter?.name ?? session.hostUser.name} ·{" "}
              {formatDuration(session.recording?.durationSeconds ?? null)} · Peak {session.peakListeners} listeners
            </p>
          </div>

          {session.recording && session.recording.fileSizeBytes ? (
            <a
              href={`/api/studio/recordings/${session.recording.id}/download`}
              className="flex w-fit shrink-0 items-center gap-2 border border-line-strong px-4 py-2.5 font-condensed text-xs font-bold uppercase tracking-[0.1em] text-grey-300 transition-colors hover:border-gold hover:text-gold"
            >
              <Download className="size-3.5" />
              Download
            </a>
          ) : (
            <span className="shrink-0 font-condensed text-xs uppercase tracking-[0.1em] text-grey-600">
              No recording
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
