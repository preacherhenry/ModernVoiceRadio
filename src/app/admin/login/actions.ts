"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import { writeAuditLog } from "@/lib/audit";
import { getRequestIp } from "@/lib/request-ip";

export type LoginState = { error?: string };

export async function login(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") || "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") || "");
  const ipAddress = await getRequestIp();

  if (!email || !password) {
    return { error: "Enter your email and password." };
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    await writeAuditLog({ action: "LOGIN_FAILED", detail: email, ipAddress });
    return { error: "Invalid email or password." };
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    await writeAuditLog({ userId: user.id, action: "LOGIN_FAILED", detail: email, ipAddress });
    return { error: "Invalid email or password." };
  }

  await createSession({ sub: user.id, email: user.email, name: user.name, role: user.role });
  await writeAuditLog({ userId: user.id, action: "LOGIN", ipAddress });
  redirect("/admin");
}
