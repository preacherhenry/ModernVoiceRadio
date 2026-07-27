"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/session";
import { getRequestIp } from "@/lib/request-ip";
import { callInternalStudio } from "@/lib/internal-control-client";

export type EmergencyFormState = { error?: string };

export async function startEmergencyAction(
  _prev: EmergencyFormState,
  formData: FormData
): Promise<EmergencyFormState> {
  const session = await requireAdmin();

  const audioFilePath = process.env.EMERGENCY_AUDIO_PATH;
  if (!audioFilePath) {
    return { error: "EMERGENCY_AUDIO_PATH is not configured in .env." };
  }

  const message = String(formData.get("message") || "").trim() || undefined;

  const result = await callInternalStudio("emergency-start", {
    hostUserId: session.sub,
    audioFilePath,
    message,
    ipAddress: await getRequestIp(),
  });

  if (!result.ok) {
    return { error: result.error };
  }

  revalidatePath("/admin/studio/emergency");
  revalidatePath("/admin/studio");
  return {};
}

export async function endEmergencyAction(sessionId: string) {
  const session = await requireAdmin();
  await callInternalStudio("emergency-end", {
    sessionId,
    userId: session.sub,
    ipAddress: await getRequestIp(),
  });
  revalidatePath("/admin/studio/emergency");
  revalidatePath("/admin/studio");
}
