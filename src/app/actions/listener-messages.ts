"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export type ListenerMessageFormState = { success?: boolean; error?: string };

const messageSchema = z.object({
  type: z.enum(["SONG_REQUEST", "SHOUTOUT", "QUESTION", "FEEDBACK"]),
  name: z.string().trim().min(1, "Please enter your name"),
  contact: z.string().trim().min(1, "Please enter a phone number or email"),
  song: z.string().trim().optional(),
  message: z.string().trim().optional(),
});

export async function submitListenerMessage(
  _prev: ListenerMessageFormState,
  formData: FormData
): Promise<ListenerMessageFormState> {
  const parsed = messageSchema.safeParse({
    type: formData.get("type") || "SONG_REQUEST",
    name: formData.get("name"),
    contact: formData.get("contact"),
    song: formData.get("song"),
    message: formData.get("message"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form for errors." };
  }

  const activeSession = await prisma.broadcastSession.findFirst({
    where: { status: { in: ["CONNECTING", "LIVE"] } },
    select: { id: true },
  });

  await prisma.listenerMessage.create({
    data: {
      type: parsed.data.type,
      name: parsed.data.name,
      contact: parsed.data.contact,
      song: parsed.data.song || null,
      message: parsed.data.message || null,
      sessionId: activeSession?.id ?? null,
    },
  });

  revalidatePath("/admin/requests");
  revalidatePath("/admin");
  return { success: true };
}
