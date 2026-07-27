"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/session";
import type { MessageStatus } from "@prisma/client";

function revalidateMessagePages() {
  revalidatePath("/admin/requests");
  revalidatePath("/admin");
}

export async function setMessageStatus(id: string, status: MessageStatus) {
  await requireUser();
  await prisma.listenerMessage.update({ where: { id }, data: { status } });
  revalidateMessagePages();
}

export async function deleteMessage(id: string) {
  await requireUser();
  await prisma.listenerMessage.delete({ where: { id } });
  revalidateMessagePages();
}
