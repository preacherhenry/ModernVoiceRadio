import "server-only";
import { headers } from "next/headers";

/** Only usable from within a Next.js request context (Server Actions / Route Handlers) — never from server.ts. */
export async function getRequestIp(): Promise<string | null> {
  const headerList = await headers();
  const forwarded = headerList.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() ?? null;
  return headerList.get("x-real-ip");
}
