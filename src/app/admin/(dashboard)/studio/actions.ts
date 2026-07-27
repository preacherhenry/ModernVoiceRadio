"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireBroadcaster } from "@/lib/auth/session";
import { getRequestIp } from "@/lib/request-ip";
import { resolveImage } from "@/lib/upload";
import { callInternalStudio } from "@/lib/internal-control-client";

export type StudioFormState = { error?: string; sessionId?: string };

const startSchema = z.object({
  presenterId: z.string().trim().optional(),
  programName: z.string().trim().min(1, "Program name is required"),
  episodeTitle: z.string().trim().optional(),
  description: z.string().trim().optional(),
  category: z.string().trim().optional(),
  tags: z.string().trim().optional(),
});

function textOrUndefined(v: FormDataEntryValue | null) {
  const s = typeof v === "string" ? v.trim() : "";
  return s.length ? s : undefined;
}

function revalidateStudioPages() {
  revalidatePath("/admin/studio");
  revalidatePath("/admin/studio/history");
  revalidatePath("/");
}

export async function startBroadcastAction(
  _prev: StudioFormState,
  formData: FormData
): Promise<StudioFormState> {
  const session = await requireBroadcaster();

  const parsed = startSchema.safeParse({
    presenterId: textOrUndefined(formData.get("presenterId")),
    programName: formData.get("programName"),
    episodeTitle: textOrUndefined(formData.get("episodeTitle")),
    description: textOrUndefined(formData.get("description")),
    category: textOrUndefined(formData.get("category")),
    tags: textOrUndefined(formData.get("tags")),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form for errors." };
  }

  let coverImage: string | undefined;
  const coverFile = formData.get("coverImage");
  if (coverFile instanceof File && coverFile.size > 0) {
    try {
      coverImage = await resolveImage(coverFile, "broadcasts");
    } catch (err) {
      return { error: err instanceof Error ? err.message : "Cover image upload failed." };
    }
  }

  let presenterName: string | undefined;
  if (parsed.data.presenterId) {
    const presenter = await prisma.presenter.findUnique({ where: { id: parsed.data.presenterId } });
    presenterName = presenter?.name;
  }

  const result = await callInternalStudio("start", {
    hostUserId: session.sub,
    presenterId: parsed.data.presenterId ?? null,
    presenterName: presenterName ?? session.name,
    programName: parsed.data.programName,
    episodeTitle: parsed.data.episodeTitle,
    description: parsed.data.description,
    category: parsed.data.category,
    tags: parsed.data.tags,
    coverImage,
    ipAddress: await getRequestIp(),
  });

  if (!result.ok) {
    return { error: result.error };
  }

  revalidateStudioPages();
  return { sessionId: result.session?.id };
}

export async function endBroadcastAction(sessionId: string) {
  const session = await requireBroadcaster();
  await callInternalStudio("end", {
    sessionId,
    userId: session.sub,
    ipAddress: await getRequestIp(),
  });
  revalidateStudioPages();
}

export async function setNowPlayingAction(_prev: StudioFormState, formData: FormData): Promise<StudioFormState> {
  await requireBroadcaster();
  await callInternalStudio("set-now-playing", {
    song: String(formData.get("song") || ""),
    artist: String(formData.get("artist") || ""),
  });
  return {};
}

export async function pauseRecordingAction(sessionId: string) {
  await requireBroadcaster();
  await callInternalStudio("pause-recording", { sessionId });
  revalidatePath("/admin/studio");
}

export async function resumeRecordingAction(sessionId: string) {
  await requireBroadcaster();
  await callInternalStudio("resume-recording", { sessionId });
  revalidatePath("/admin/studio");
}

export async function stopRecordingAction(sessionId: string) {
  await requireBroadcaster();
  await callInternalStudio("stop-recording", { sessionId });
  revalidatePath("/admin/studio");
  revalidatePath("/admin/studio/history");
}

export async function updateStreamInfoAction(sessionId: string, formData: FormData) {
  const session = await requireBroadcaster();

  const parsed = startSchema.safeParse({
    presenterId: textOrUndefined(formData.get("presenterId")),
    programName: formData.get("programName"),
    episodeTitle: textOrUndefined(formData.get("episodeTitle")),
    description: textOrUndefined(formData.get("description")),
    category: textOrUndefined(formData.get("category")),
    tags: textOrUndefined(formData.get("tags")),
  });
  if (!parsed.success) return;

  const broadcastSession = await prisma.broadcastSession.findUnique({ where: { id: sessionId } });
  if (!broadcastSession || (broadcastSession.hostUserId !== session.sub && session.role !== "ADMIN")) {
    return;
  }

  let coverImage = broadcastSession.coverImage ?? undefined;
  const coverFile = formData.get("coverImage");
  if (coverFile instanceof File && coverFile.size > 0) {
    coverImage = await resolveImage(coverFile, "broadcasts", broadcastSession.coverImage ?? undefined);
  }

  let presenterName: string | undefined;
  if (parsed.data.presenterId) {
    const presenter = await prisma.presenter.findUnique({ where: { id: parsed.data.presenterId } });
    presenterName = presenter?.name;
  }

  await callInternalStudio("update-info", {
    sessionId,
    requesterId: session.sub,
    isAdmin: session.role === "ADMIN",
    presenterId: parsed.data.presenterId ?? null,
    presenterName: presenterName ?? session.name,
    programName: parsed.data.programName,
    episodeTitle: parsed.data.episodeTitle ?? null,
    description: parsed.data.description ?? null,
    category: parsed.data.category ?? null,
    tags: parsed.data.tags ?? null,
    coverImage: coverImage ?? null,
  });

  revalidateStudioPages();
}
