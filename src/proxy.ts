import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth/jwt";
import { prisma } from "@/lib/prisma";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const payload = token ? await verifySessionToken(token) : null;

  // A signature-valid JWT can still point at a user row that no longer
  // exists (the ephemeral SQLite DB reseeds with new user ids on restart).
  // Without this check, proxy would treat that stale cookie as a valid
  // session and bounce the user away from /admin/login back to /admin,
  // while the dashboard layout's own (stricter) check bounces them right
  // back to /admin/login - an infinite redirect loop.
  const session = payload
    ? await prisma.user.findUnique({ where: { id: payload.sub }, select: { id: true } })
    : null;

  if (pathname === "/admin/login") {
    if (session) return NextResponse.redirect(new URL("/admin", request.url));
    return NextResponse.next();
  }

  if (!session) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
