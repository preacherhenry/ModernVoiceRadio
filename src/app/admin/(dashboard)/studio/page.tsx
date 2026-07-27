import { requireBroadcaster } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import StudioConsole from "./components/StudioConsole";

export default async function StudioPage({
  searchParams,
}: {
  searchParams: Promise<{ programName?: string; presenterId?: string; category?: string }>;
}) {
  const session = await requireBroadcaster();
  const params = await searchParams;

  const [presenters, user, activeSession] = await Promise.all([
    prisma.presenter.findMany({ orderBy: { name: "asc" } }),
    prisma.user.findUnique({ where: { id: session.sub }, select: { presenterId: true } }),
    prisma.broadcastSession.findFirst({
      where: { status: { in: ["CONNECTING", "LIVE"] } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <StudioConsole
      presenters={presenters}
      defaultPresenterId={user?.presenterId ?? undefined}
      prefill={
        !activeSession && (params.programName || params.presenterId)
          ? {
              programName: params.programName,
              presenterId: params.presenterId,
              category: params.category,
            }
          : undefined
      }
      initialSession={
        activeSession
          ? {
              id: activeSession.id,
              status: activeSession.status as "CONNECTING" | "LIVE",
              programName: activeSession.programName,
              startedAt: activeSession.startedAt?.toISOString() ?? null,
              presenterId: activeSession.presenterId,
              episodeTitle: activeSession.episodeTitle,
              description: activeSession.description,
              category: activeSession.category,
              tags: activeSession.tags,
              coverImage: activeSession.coverImage,
            }
          : null
      }
    />
  );
}
