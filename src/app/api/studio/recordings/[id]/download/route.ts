import { NextResponse } from "next/server";
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";
import { requireBroadcaster } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  await requireBroadcaster();
  const { id } = await params;

  const recording = await prisma.recording.findUnique({
    where: { id },
    include: { session: true },
  });

  if (!recording) {
    return NextResponse.json({ error: "Recording not found" }, { status: 404 });
  }

  const absolutePath = path.join(process.cwd(), recording.filePath);
  const fileStat = await stat(absolutePath).catch(() => null);
  if (!fileStat) {
    return NextResponse.json({ error: "Recording file is not available." }, { status: 404 });
  }

  const filename = `${recording.session.programName.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-${recording.session.id.slice(0, 8)}.mp3`;

  return new NextResponse(Readable.toWeb(createReadStream(absolutePath)) as ReadableStream, {
    headers: {
      "Content-Type": "audio/mpeg",
      "Content-Length": String(fileStat.size),
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
