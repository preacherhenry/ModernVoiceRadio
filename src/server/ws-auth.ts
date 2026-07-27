import type { IncomingMessage } from "node:http";
import { SESSION_COOKIE, verifySessionToken, type SessionPayload } from "@/lib/auth/jwt";

function parseCookies(cookieHeader: string | undefined): Record<string, string> {
  const out: Record<string, string> = {};
  if (!cookieHeader) return out;
  for (const pair of cookieHeader.split(";")) {
    const idx = pair.indexOf("=");
    if (idx === -1) continue;
    const key = pair.slice(0, idx).trim();
    const value = pair.slice(idx + 1).trim();
    if (key) out[key] = decodeURIComponent(value);
  }
  return out;
}

const BROADCASTER_ROLES: SessionPayload["role"][] = ["ADMIN", "STUDIO_MANAGER", "PRESENTER"];

export async function authenticateWsRequest(req: IncomingMessage): Promise<SessionPayload | null> {
  const cookies = parseCookies(req.headers.cookie);
  const token = cookies[SESSION_COOKIE];
  if (!token) return null;
  return verifySessionToken(token);
}

export function isBroadcasterRole(role: SessionPayload["role"]): boolean {
  return BROADCASTER_ROLES.includes(role);
}

export function getRequestIp(req: IncomingMessage): string | null {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.length > 0) {
    return forwarded.split(",")[0]?.trim() ?? null;
  }
  return req.socket.remoteAddress ?? null;
}
