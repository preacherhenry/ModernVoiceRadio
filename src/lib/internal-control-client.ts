import "server-only";

export type InternalControlSession = {
  id: string;
  hostUserId: string;
  presenterId: string | null;
  programName: string;
  episodeTitle: string | null;
  description: string | null;
  category: string | null;
  tags: string | null;
  coverImage: string | null;
  status: "CONNECTING" | "LIVE" | "ENDED" | "ERROR";
  isEmergency: boolean;
  startedAt: string | null;
  endedAt: string | null;
  peakListeners: number;
  errorMessage: string | null;
  createdAt: string;
};

export type InternalControlResponse =
  | { ok: true; session?: InternalControlSession; activeSessionId?: string | null }
  | { ok: false; error: string; activeSessionId?: string };

export async function callInternalStudio(
  action: string,
  params: Record<string, unknown> = {}
): Promise<InternalControlResponse> {
  const port = process.env.PORT || "3000";
  const secret = process.env.INTERNAL_API_SECRET;

  if (!secret) {
    return { ok: false, error: "INTERNAL_API_SECRET is not configured." };
  }

  try {
    const res = await fetch(`http://127.0.0.1:${port}/internal/studio`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-internal-secret": secret,
      },
      body: JSON.stringify({ action, params }),
      cache: "no-store",
    });
    return (await res.json()) as InternalControlResponse;
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to reach the broadcast server.",
    };
  }
}
