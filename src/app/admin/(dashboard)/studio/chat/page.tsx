import { requireBroadcaster } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import ChatPanel from "./ChatPanel";

export default async function StudioChatPage() {
  const session = await requireBroadcaster();

  const activeSession = await prisma.broadcastSession.findFirst({
    where: { status: { in: ["CONNECTING", "LIVE"] } },
    orderBy: { createdAt: "desc" },
  });

  if (!activeSession) {
    return (
      <div className="border border-line bg-ink-2 p-8 text-center">
        <p className="text-sm text-grey-400">
          No active broadcast right now. Studio chat opens automatically once someone goes live.
        </p>
      </div>
    );
  }

  return <ChatPanel sessionId={activeSession.id} currentUserId={session.sub} />;
}
