/**
 * Requests a delivery-optimised version of a Cloudinary-hosted image.
 *
 * Posters are uploaded at full quality — an advert poster measured 2MB as a PNG, which
 * took ~18s to fetch on a mobile connection. Anything with a time limit (the interstitial
 * popup dismisses after 5s) would be gone before the image ever appeared. Asking
 * Cloudinary for `f_auto,q_auto` plus a sensible width returns the same poster at roughly
 * a tenth of the size, in WebP where the device supports it.
 *
 * Non-Cloudinary URLs are returned untouched, so this is safe to apply to any image
 * source. URLs that already carry a transformation are left alone rather than nested.
 */
const CLOUDINARY_UPLOAD_MARKER = '/image/upload/';

/** Transformation segments Cloudinary understands, used to detect an existing one. */
const TRANSFORM_HINT = /^[a-z]_[^/]+/;

export function optimizedImageUrl(url: string | null | undefined, width = 1000): string {
  if (!url) return '';

  const markerAt = url.indexOf(CLOUDINARY_UPLOAD_MARKER);
  if (markerAt === -1) return url;

  const prefix = url.slice(0, markerAt + CLOUDINARY_UPLOAD_MARKER.length);
  const rest = url.slice(markerAt + CLOUDINARY_UPLOAD_MARKER.length);

  // Already transformed (e.g. ".../upload/w_500/v123/x.png") — don't stack another.
  const firstSegment = rest.split('/')[0] ?? '';
  if (TRANSFORM_HINT.test(firstSegment)) return url;

  return `${prefix}f_auto,q_auto,w_${width}/${rest}`;
}

export default optimizedImageUrl;
