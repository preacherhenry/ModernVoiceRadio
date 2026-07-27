import "server-only";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export async function saveUploadedImage(file: File, folder: string): Promise<string> {
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new Error("Unsupported image type. Use JPG, PNG, WEBP or GIF.");
  }
  if (file.size > MAX_SIZE) {
    throw new Error("Image must be smaller than 5MB.");
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const ext = path.extname(file.name) || ".jpg";
  const filename = `${randomUUID()}${ext}`;
  const dir = path.join(process.cwd(), "public", "uploads", folder);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, filename), bytes);

  return `/uploads/${folder}/${filename}`;
}

export async function resolveImage(
  file: File | null | undefined,
  folder: string,
  existing?: string
): Promise<string | undefined> {
  if (file && file.size > 0) {
    return saveUploadedImage(file, folder);
  }
  return existing;
}
