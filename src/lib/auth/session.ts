import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
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

  // The session cookie is a signed JWT, so it stays valid even if the
  // underlying User row is gone - which happens on this deployment because
  // the SQLite database resets on every restart/redeploy. A stale cookie
  // still passes signature verification but its user id no longer exists,
  // which surfaces downstream as a confusing foreign key error (e.g. when
  // starting a broadcast) instead of a clean re-login prompt. Catch it here.
  // Note: requireUser() runs during Server Component renders (layouts/pages),
  // where cookies() can only be read, not mutated - so we can't clear the
  // cookie here. The redirect alone is enough; logging in again overwrites
  // it via createSession(), which does run in a Server Action.
  const exists = await prisma.user.findUnique({ where: { id: session.sub }, select: { id: true } });
  if (!exists) {
    redirect("/admin/login?reason=session-expired");
  }

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
