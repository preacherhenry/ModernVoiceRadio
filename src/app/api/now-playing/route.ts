import { NextResponse } from "next/server";
import { getStreamStatus } from "@/lib/stream";

export const dynamic = "force-dynamic";

export async function GET() {
  const status = await getStreamStatus();
  return NextResponse.json(status, {
    headers: { "Cache-Control": "no-store" },
  });
}
