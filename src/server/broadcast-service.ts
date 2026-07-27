import { prisma } from "@/lib/prisma";
import { writeAuditLog } from "@/lib/audit";
import {
  getActiveSessionId,
  startBroadcastRelay,
  startEmergencyRelay,
  stopBroadcastRelay,
} from "./broadcast-relay";
import { publishPublicEvent } from "./event-bus";

export class StudioOccupiedError extends Error {
  constructor(public readonly activeSessionId: string) {
    super("The studio is currently occupied by another broadcast.");
  }
}

export async function startBroadcast(params: {
  hostUserId: string;
  presenterId?: string | null;
  presenterName?: string;
  programName: string;
  episodeTitle?: string;
  description?: string;
  category?: string;
  tags?: string;
  coverImage?: string;
  ipAddress?: string | null;
}) {
  const activeId = getActiveSessionId();
  if (activeId) throw new StudioOccupiedError(activeId);

  const session = await prisma.broadcastSession.create({
    data: {
      hostUserId: params.hostUserId,
      presenterId: params.presenterId ?? null,
      programName: params.programName,
      episodeTitle: params.episodeTitle ?? null,
      description: params.description ?? null,
      category: params.category ?? null,
      tags: params.tags ?? null,
      coverImage: params.coverImage ?? null,
      status: "CONNECTING",
    },
  });

  publishPublicEvent({
    type: "status",
    payload: {
      status: "CONNECTING",
      programName: params.programName,
      presenterName: params.presenterName,
      episodeTitle: params.episodeTitle,
      coverImage: params.coverImage,
      sessionId: session.id,
    },
  });

  try {
    await startBroadcastRelay(session.id);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    await prisma.broadcastSession.update({
      where: { id: session.id },
      data: { status: "ERROR", errorMessage: message },
    });
    publishPublicEvent({ type: "status", payload: { status: "OFFLINE" } });
    await writeAuditLog({
      userId: params.hostUserId,
      action: "ERROR",
      detail: `Broadcast start failed: ${message}`,
      ipAddress: params.ipAddress,
    });
    throw err;
  }

  const startedAt = new Date();
  const updated = await prisma.broadcastSession.update({
    where: { id: session.id },
    data: { status: "LIVE", startedAt },
  });

  await prisma.recording.create({
    data: {
      sessionId: session.id,
      filePath: `recordings/${session.id}.mp3`,
      status: "RECORDING",
    },
  });

  publishPublicEvent({
    type: "status",
    payload: {
      status: "LIVE",
      programName: params.programName,
      presenterName: params.presenterName,
      episodeTitle: params.episodeTitle,
      coverImage: params.coverImage,
      startedAt: startedAt.toISOString(),
      sessionId: session.id,
    },
  });

  await writeAuditLog({
    userId: params.hostUserId,
    action: "BROADCAST_START",
    detail: params.programName,
    ipAddress: params.ipAddress,
  });

  return updated;
}

export async function endBroadcast(
  sessionId: string,
  opts: { userId?: string; ipAddress?: string | null; reason?: string } = {}
) {
  const session = await prisma.broadcastSession.findUnique({ where: { id: sessionId } });
  if (!session || session.status === "ENDED") return session;

  const { recording } = await stopBroadcastRelay(sessionId);

  const updated = await prisma.broadcastSession.update({
    where: { id: sessionId },
    data: { status: "ENDED", endedAt: new Date() },
  });

  if (recording) {
    const durationSeconds = session.startedAt
      ? Math.max(0, Math.round((Date.now() - session.startedAt.getTime()) / 1000))
      : null;
    await prisma.recording
      .update({
        where: { sessionId },
        data: { status: "STOPPED", fileSizeBytes: recording.fileSizeBytes, durationSeconds },
      })
      .catch(() => null);
  }

  publishPublicEvent({ type: "status", payload: { status: "OFFLINE" } });

  await writeAuditLog({
    userId: opts.userId ?? session.hostUserId,
    action: "BROADCAST_STOP",
    detail: opts.reason ?? session.programName,
    ipAddress: opts.ipAddress ?? null,
  });

  return updated;
}

export async function startEmergencyBroadcast(params: {
  hostUserId: string;
  audioFilePath: string;
  message?: string;
  ipAddress?: string | null;
}) {
  const activeId = getActiveSessionId();
  if (activeId) {
    await endBroadcast(activeId, {
      userId: params.hostUserId,
      ipAddress: params.ipAddress,
      reason: "Interrupted by emergency broadcast",
    });
  }

  const session = await prisma.broadcastSession.create({
    data: {
      hostUserId: params.hostUserId,
      programName: "Emergency Broadcast",
      description: params.message ?? null,
      status: "CONNECTING",
      isEmergency: true,
    },
  });

  await startEmergencyRelay(session.id, params.audioFilePath);

  const startedAt = new Date();
  const updated = await prisma.broadcastSession.update({
    where: { id: session.id },
    data: { status: "LIVE", startedAt },
  });

  publishPublicEvent({
    type: "status",
    payload: {
      status: "LIVE",
      programName: "Emergency Broadcast",
      startedAt: startedAt.toISOString(),
      sessionId: session.id,
    },
  });
  publishPublicEvent({ type: "emergency", payload: { active: true, message: params.message } });

  await writeAuditLog({
    userId: params.hostUserId,
    action: "EMERGENCY_BROADCAST",
    detail: params.message ?? "Emergency broadcast activated",
    ipAddress: params.ipAddress,
  });

  return updated;
}

export async function endEmergencyBroadcast(
  sessionId: string,
  opts: { userId?: string; ipAddress?: string | null } = {}
) {
  const updated = await endBroadcast(sessionId, { ...opts, reason: "Emergency broadcast ended" });
  publishPublicEvent({ type: "emergency", payload: { active: false } });
  return updated;
}

export async function updateStreamInfo(
  sessionId: string,
  params: {
    requesterId: string;
    isAdmin: boolean;
    presenterId?: string | null;
    presenterName?: string;
    programName: string;
    episodeTitle?: string | null;
    description?: string | null;
    category?: string | null;
    tags?: string | null;
    coverImage?: string | null;
  }
) {
  const session = await prisma.broadcastSession.findUnique({ where: { id: sessionId } });
  if (!session) throw new Error("Broadcast session not found.");
  if (session.hostUserId !== params.requesterId && !params.isAdmin) {
    throw new Error("You can only edit your own broadcast.");
  }

  const updated = await prisma.broadcastSession.update({
    where: { id: sessionId },
    data: {
      presenterId: params.presenterId ?? null,
      programName: params.programName,
      episodeTitle: params.episodeTitle ?? null,
      description: params.description ?? null,
      category: params.category ?? null,
      tags: params.tags ?? null,
      coverImage: params.coverImage ?? null,
    },
  });

  if (updated.status === "LIVE" || updated.status === "CONNECTING") {
    publishPublicEvent({
      type: "status",
      payload: {
        status: updated.status,
        programName: updated.programName,
        presenterName: params.presenterName,
        episodeTitle: updated.episodeTitle ?? undefined,
        coverImage: updated.coverImage ?? undefined,
        startedAt: updated.startedAt?.toISOString() ?? null,
        sessionId: updated.id,
      },
    });
  }

  return updated;
}
