import { requireAdmin } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import EmergencyPanel from "./EmergencyPanel";

export default async function StudioEmergencyPage() {
  await requireAdmin();

  const activeEmergency = await prisma.broadcastSession.findFirst({
    where: { status: { in: ["CONNECTING", "LIVE"] }, isEmergency: true },
  });

  return <EmergencyPanel activeSessionId={activeEmergency?.id ?? null} />;
}
