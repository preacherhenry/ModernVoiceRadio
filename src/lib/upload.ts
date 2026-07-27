import "server-only";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import sharp from "sharp";

const MAX_SIZE = 5 * 1024 * 1024; // 5MB

// Formats the browser can already render natively - saved untouched so we
// never risk breaking e.g. animated GIFs by re-encoding them.
const PASSTHROUGH_FORMATS: Record<string, string> = {
  jpeg: ".jpg",
  png: ".png",
  webp: ".webp",
  gif: ".gif",
};

export async function saveUploadedImage(file: File, folder: string): Promise<string> {
  if (file.size > MAX_SIZE) {
    throw new Error("Image must be smaller than 5MB.");
  }

  const bytes = Buffer.from(await file.arrayBuffer());

  // Trust the actual file bytes, not the browser-reported extension/MIME
  // type (both are easy to get wrong, e.g. a renamed file, or a phone
  // reporting a generic type) - decode it for real to find out what it is.
  let format: string;
  try {
    const metadata = await sharp(bytes).metadata();
    if (!metadata.format) throw new Error("unrecognized");
    format = metadata.format;
  } catch {
    throw new Error(
      "That file couldn't be read as an image. JPG, PNG, WEBP, GIF, TIFF, AVIF and SVG are supported. " +
        "iPhone HEIC photos aren't decodable here - in Settings > Camera > Formats, switch to \"Most Compatible\" and re-take/re-export the photo, or convert it to JPEG first."
    );
  }

  let outBytes: Buffer = bytes;
  let ext: string;
  if (format in PASSTHROUGH_FORMATS) {
    ext = PASSTHROUGH_FORMATS[format];
  } else {
    // Anything else the decoder understood but a browser can't display
    // directly (TIFF, SVG, AVIF, ...) - normalize to JPEG. This also
    // neutralizes any script content in an uploaded SVG, since rasterizing
    // it strips everything but the rendered pixels.
    outBytes = await sharp(bytes).rotate().flatten({ background: "#0b0b0f" }).jpeg({ quality: 90 }).toBuffer();
    ext = ".jpg";
  }

  const filename = `${randomUUID()}${ext}`;
  const dir = path.join(process.cwd(), "public", "uploads", folder);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, filename), outBytes);

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
