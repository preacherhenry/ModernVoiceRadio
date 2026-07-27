import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { createHash } from "node:crypto";
import { UAParser } from "ua-parser-js";
import { prisma } from "@/lib/prisma";
import { lookupGeo } from "@/lib/geo-lookup";

export const dynamic = "force-dynamic";

export async function POST() {
  const headerList = await headers();
  const forwarded = headerList.get("x-forwarded-for");
  const ip = (forwarded ? forwarded.split(",")[0]?.trim() : null) || headerList.get("x-real-ip") || "0.0.0.0";
  const userAgent = headerList.get("user-agent") || "";

  const salt = process.env.AUTH_SECRET || "listener-beacon";
  const ipHash = createHash("sha256").update(ip + salt).digest("hex");

  const parser = new UAParser(userAgent);
  const result = parser.getResult();
  const device = result.device.type ?? "desktop";
  const os = result.os.name ?? null;
  const browser = result.browser.name ?? null;

  const { country, city } = await lookupGeo(ip);

  await prisma.listenerSession.upsert({
    where: { ipHash },
    update: { country, city, device, os, browser },
    create: { ipHash, country, city, device, os, browser },
  });

  return NextResponse.json({ ok: true });
}
