/** True for files saved by our own upload pipeline (src/lib/upload.ts). */
export function isLocalUpload(src: string): boolean {
  return src.startsWith("/uploads/");
}
