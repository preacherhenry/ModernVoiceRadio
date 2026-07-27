const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const cache = new Map<string, { country: string | null; city: string | null; expires: number }>();

type IpApiResponse = {
  status: "success" | "fail";
  country?: string;
  city?: string;
};

/**
 * Resolves country/city from a raw IP using ip-api.com's free, non-commercial
 * endpoint (45 req/min limit). Never fabricates a location — returns nulls on
 * any failure, rate limit, or private/loopback address.
 */
export async function lookupGeo(ip: string): Promise<{ country: string | null; city: string | null }> {
  const cached = cache.get(ip);
  if (cached && cached.expires > Date.now()) {
    return { country: cached.country, city: cached.city };
  }

  if (!ip || ip === "127.0.0.1" || ip === "::1" || ip.startsWith("192.168.") || ip.startsWith("10.")) {
    return { country: null, city: null };
  }

  try {
    const res = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,city`, {
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) throw new Error(`ip-api request failed: ${res.status}`);

    const data: IpApiResponse = await res.json();
    const result =
      data.status === "success"
        ? { country: data.country ?? null, city: data.city ?? null }
        : { country: null, city: null };

    cache.set(ip, { ...result, expires: Date.now() + CACHE_TTL_MS });
    return result;
  } catch {
    return { country: null, city: null };
  }
}
