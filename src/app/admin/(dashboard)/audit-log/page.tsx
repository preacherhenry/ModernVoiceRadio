import { FileClock } from "lucide-react";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { cn } from "@/lib/utils";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/session";

const actionStyles: Record<string, string> = {
  LOGIN: "border-emerald-500 text-emerald-400",
  LOGIN_FAILED: "border-red text-red-bright",
  BROADCAST_START: "border-gold text-gold",
  BROADCAST_STOP: "border-line-strong text-grey-300",
  EMERGENCY_BROADCAST: "border-red text-red-bright",
  ERROR: "border-red text-red-bright",
  USER_CHANGE: "border-line-strong text-grey-300",
};

export default async function AuditLogPage() {
  await requireAdmin();

  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { user: { select: { name: true, email: true } } },
  });

  return (
    <div>
      <AdminPageHeader eyebrow="Security" title="Audit Log" />

      <div className="mt-8 flex flex-col divide-y divide-line border border-line">
        {logs.length === 0 && (
          <p className="p-6 text-sm text-grey-500">No events logged yet.</p>
        )}
        {logs.map((log) => (
          <div key={log.id} className="flex flex-col gap-2 bg-ink-2 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <span
                className={cn(
                  "shrink-0 border px-2.5 py-0.5 font-condensed text-[11px] font-bold uppercase tracking-[0.1em]",
                  actionStyles[log.action] ?? "border-line-strong text-grey-400"
                )}
              >
                {log.action.replace("_", " ")}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm text-white">
                  {log.user ? `${log.user.name} (${log.user.email})` : "Unknown user"}
                </p>
                {log.detail && <p className="truncate text-xs text-grey-500">{log.detail}</p>}
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-4 font-condensed text-xs text-grey-500">
              {log.ipAddress && <span>{log.ipAddress}</span>}
              <span className="flex items-center gap-1.5">
                <FileClock className="size-3.5" />
                {log.createdAt.toLocaleString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
