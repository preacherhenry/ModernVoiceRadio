import { NextResponse } from "next/server";
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";
import { UPLOADS_ROOT } from "@/lib/upload";

const CONTENT_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

export async function GET(_req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path: segments } = await params;

  if (segments.length === 0 || segments.some((s) => s.includes("..") || s.includes("/") || s.includes("\\"))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const absolutePath = path.join(UPLOADS_ROOT, ...segments);
  if (!absolutePath.startsWith(UPLOADS_ROOT)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const fileStat = await stat(absolutePath).catch(() => null);
  if (!fileStat || !fileStat.isFile()) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const ext = path.extname(absolutePath).toLowerCase();
  const contentType = CONTENT_TYPES[ext] ?? "application/octet-stream";

  return new NextResponse(Readable.toWeb(createReadStream(absolutePath)) as ReadableStream, {
    headers: {
      "Content-Type": contentType,
      "Content-Length": String(fileStat.size),
      // Filenames are random UUIDs assigned once at upload and never reused,
      // so a long-lived cache is safe.
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
