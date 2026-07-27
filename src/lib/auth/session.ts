import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  SESSION_COOKIE,
  SESSION_DURATION_SECONDS,
  signSession,
  verifySessionToken,
  type SessionPayload,
} from "./jwt";

export type { SessionPayload };

export async function createSession(user: SessionPayload) {
  const token = await signSession(user);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION_SECONDS,
  });
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export async function requireUser(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  return session;
}

export async function requireAdmin(): Promise<SessionPayload> {
  const session = await requireUser();
  if (session.role !== "ADMIN") redirect("/admin");
  return session;
}

const BROADCASTER_ROLES: SessionPayload["role"][] = ["ADMIN", "STUDIO_MANAGER", "PRESENTER"];

export async function requireBroadcaster(): Promise<SessionPayload> {
  const session = await requireUser();
  if (!BROADCASTER_ROLES.includes(session.role)) redirect("/admin");
  return session;
}
