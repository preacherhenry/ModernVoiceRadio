import { prisma } from "./prisma";

export type AuditAction =
  | "LOGIN"
  | "LOGIN_FAILED"
  | "BROADCAST_START"
  | "BROADCAST_STOP"
  | "EMERGENCY_BROADCAST"
  | "ERROR"
  | "USER_CHANGE";

export async function writeAuditLog(entry: {
  userId?: string | null;
  action: AuditAction;
  detail?: string;
  ipAddress?: string | null;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: entry.userId ?? null,
        action: entry.action,
        detail: entry.detail ?? null,
        ipAddress: entry.ipAddress ?? null,
      },
    });
  } catch (err) {
    console.error("[audit] failed to write audit log entry:", err);
  }
}
