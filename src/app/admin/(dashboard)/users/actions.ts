"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/session";
import { hashPassword } from "@/lib/auth/password";
import { writeAuditLog } from "@/lib/audit";
import { getRequestIp } from "@/lib/request-ip";

export type FormState = { error?: string };

const userSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z.string().trim().email("Enter a valid email address").toLowerCase(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["ADMIN", "STUDIO_MANAGER", "PRESENTER"]),
  presenterId: z.string().trim().optional(),
});

function textOrUndefined(v: FormDataEntryValue | null) {
  const s = typeof v === "string" ? v.trim() : "";
  return s.length ? s : undefined;
}

export async function createStaffUser(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await requireAdmin();

  const parsed = userSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role"),
    presenterId: textOrUndefined(formData.get("presenterId")),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form for errors." };
  }

  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (existing) {
    return { error: "An account with this email already exists." };
  }

  const passwordHash = await hashPassword(parsed.data.password);

  const created = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash,
      role: parsed.data.role,
      presenterId: parsed.data.presenterId ?? null,
    },
  });

  await writeAuditLog({
    userId: session.sub,
    action: "USER_CHANGE",
    detail: `Created ${created.role} account: ${created.email}`,
    ipAddress: await getRequestIp(),
  });

  revalidatePath("/admin/users");
  redirect("/admin/users");
}

export async function deleteUser(id: string) {
  const session = await requireAdmin();
  if (session.sub === id) {
    throw new Error("You can't delete your own account.");
  }
  const deleted = await prisma.user.delete({ where: { id } });
  await writeAuditLog({
    userId: session.sub,
    action: "USER_CHANGE",
    detail: `Deleted account: ${deleted.email}`,
    ipAddress: await getRequestIp(),
  });
  revalidatePath("/admin/users");
}

export async function resetUserPassword(id: string, formData: FormData) {
  const session = await requireAdmin();
  const password = String(formData.get("password") || "");
  if (password.length < 8) {
    throw new Error("Password must be at least 8 characters.");
  }
  const passwordHash = await hashPassword(password);
  const updated = await prisma.user.update({ where: { id }, data: { passwordHash } });
  await writeAuditLog({
    userId: session.sub,
    action: "USER_CHANGE",
    detail: `Reset password for: ${updated.email}`,
    ipAddress: await getRequestIp(),
  });
  revalidatePath("/admin/users");
}
