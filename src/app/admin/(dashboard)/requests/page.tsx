import { CheckCircle2, Archive, RotateCcw, Radio, Megaphone, HelpCircle, MessageSquare, Reply } from "lucide-react";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import DeleteButton from "@/components/admin/DeleteButton";
import { cn } from "@/lib/utils";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";
import { setMessageStatus, deleteMessage } from "./actions";

const statusStyles: Record<string, string> = {
  NEW: "border-red text-red",
  APPROVED: "border-gold text-gold",
  READ_ON_AIR: "border-emerald-500 text-emerald-400",
  ARCHIVED: "border-line-strong text-grey-500",
};

const typeMeta: Record<string, { label: string; icon: typeof Radio }> = {
  SONG_REQUEST: { label: "Song Request", icon: Radio },
  SHOUTOUT: { label: "Shoutout", icon: Megaphone },
  QUESTION: { label: "Question", icon: HelpCircle },
  FEEDBACK: { label: "Feedback", icon: MessageSquare },
};

function replyHref(contact: string) {
  const trimmed = contact.trim();
  const isEmail = /\S+@\S+\.\S+/.test(trimmed);
  if (isEmail) return `mailto:${trimmed}`;
  const digits = trimmed.replace(/[^\d+]/g, "");
  return digits ? `sms:${digits}` : undefined;
}

export default async function AdminRequestsPage() {
  const messages = await prisma.listenerMessage.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <AdminPageHeader eyebrow="On Air With You" title="Listener Messages" />

      <div className="mt-8 flex flex-col divide-y divide-line border border-line">
        {messages.length === 0 && (
          <p className="p-6 text-sm text-grey-500">No messages submitted yet.</p>
        )}
        {messages.map((m) => {
          const meta = typeMeta[m.type];
          const TypeIcon = meta.icon;
          const reply = replyHref(m.contact);

          return (
            <div key={m.id} className="flex flex-col gap-3 bg-ink-2 p-5 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="flex items-center gap-1.5 font-condensed text-xs font-bold uppercase tracking-[0.1em] text-grey-400">
                    <TypeIcon className="size-3.5" />
                    {meta.label}
                  </span>
                  <p className="text-sm font-semibold text-white">{m.name}</p>
                  <span
                    className={cn(
                      "border px-2.5 py-0.5 font-condensed text-[11px] font-bold uppercase tracking-[0.1em]",
                      statusStyles[m.status]
                    )}
                  >
                    {m.status.replace("_", " ")}
                  </span>
                  <span className="font-condensed text-xs uppercase tracking-[0.1em] text-grey-500">
                    {formatDate(m.createdAt.toISOString())}
                  </span>
                </div>
                <p className="mt-1 text-xs text-grey-500">{m.contact}</p>
                {m.song && (
                  <p className="mt-2 text-sm text-gold">
                    🎵 <span className="text-white">{m.song}</span>
                  </p>
                )}
                {m.message && <p className="mt-1 text-sm text-grey-300">{m.message}</p>}
              </div>

              <div className="flex shrink-0 flex-wrap items-center gap-2">
                {reply && (
                  <a
                    href={reply}
                    className="flex items-center gap-1.5 border border-line-strong px-3 py-1.5 font-condensed text-xs font-semibold uppercase tracking-[0.08em] text-grey-300 transition-colors hover:border-white hover:text-white"
                  >
                    <Reply className="size-3.5" />
                    Reply
                  </a>
                )}
                {m.status !== "APPROVED" && (
                  <form action={setMessageStatus.bind(null, m.id, "APPROVED")}>
                    <button
                      type="submit"
                      className="flex items-center gap-1.5 border border-line-strong px-3 py-1.5 font-condensed text-xs font-semibold uppercase tracking-[0.08em] text-grey-300 transition-colors hover:border-gold hover:text-gold"
                    >
                      <CheckCircle2 className="size-3.5" />
                      Approve
                    </button>
                  </form>
                )}
                {m.status !== "READ_ON_AIR" && (
                  <form action={setMessageStatus.bind(null, m.id, "READ_ON_AIR")}>
                    <button
                      type="submit"
                      className="flex items-center gap-1.5 border border-line-strong px-3 py-1.5 font-condensed text-xs font-semibold uppercase tracking-[0.08em] text-grey-300 transition-colors hover:border-emerald-500 hover:text-emerald-400"
                    >
                      <Radio className="size-3.5" />
                      Read On Air
                    </button>
                  </form>
                )}
                {m.status !== "ARCHIVED" && (
                  <form action={setMessageStatus.bind(null, m.id, "ARCHIVED")}>
                    <button
                      type="submit"
                      className="flex items-center gap-1.5 border border-line-strong px-3 py-1.5 font-condensed text-xs font-semibold uppercase tracking-[0.08em] text-grey-300 transition-colors hover:border-line-strong hover:text-white"
                    >
                      <Archive className="size-3.5" />
                      Archive
                    </button>
                  </form>
                )}
                {m.status !== "NEW" && (
                  <form action={setMessageStatus.bind(null, m.id, "NEW")}>
                    <button
                      type="submit"
                      className="flex items-center gap-1.5 border border-line-strong px-3 py-1.5 font-condensed text-xs font-semibold uppercase tracking-[0.08em] text-grey-300 transition-colors hover:border-red hover:text-red"
                    >
                      <RotateCcw className="size-3.5" />
                      Reopen
                    </button>
                  </form>
                )}
                <DeleteButton action={deleteMessage.bind(null, m.id)} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
