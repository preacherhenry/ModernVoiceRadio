import "server-only";

const CACHE_TTL_MS = 10 * 60 * 1000;
const cache = new Map<string, { url: string | null; expires: number }>();

type ITunesSearchResponse = {
  results?: Array<{ artworkUrl100?: string }>;
};

export async function lookupArtwork(artist: string, title: string): Promise<string | null> {
  const key = `${artist}::${title}`.toLowerCase();
  const cached = cache.get(key);
  if (cached && cached.expires > Date.now()) return cached.url;

  try {
    const term = encodeURIComponent(`${artist} ${title}`);
    const res = await fetch(`https://itunes.apple.com/search?term=${term}&entity=song&limit=1`, {
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) throw new Error(`iTunes search failed: ${res.status}`);

    const data: ITunesSearchResponse = await res.json();
    const artwork100 = data.results?.[0]?.artworkUrl100;
    const url = artwork100 ? artwork100.replace("100x100", "500x500") : null;

    cache.set(key, { url, expires: Date.now() + CACHE_TTL_MS });
    return url;
  } catch {
    cache.set(key, { url: null, expires: Date.now() + CACHE_TTL_MS });
    return null;
  }
}
