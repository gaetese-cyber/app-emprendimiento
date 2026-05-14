// In-memory sliding-window rate limiter, scoped per (route, ip).
// Honest tradeoff: in serverless this resets per cold start, so it's a soft
// brake against casual abuse from a single browser/tab — not a hardened
// defense. For production scale, swap with @upstash/ratelimit + Redis.

type Bucket = { hits: number[] };
const buckets = new Map<string, Bucket>();

let lastSweep = 0;
const SWEEP_INTERVAL_MS = 60_000;

function sweep(now: number, windowMs: number) {
  if (now - lastSweep < SWEEP_INTERVAL_MS) return;
  lastSweep = now;
  for (const [key, bucket] of buckets) {
    bucket.hits = bucket.hits.filter((t) => now - t < windowMs);
    if (bucket.hits.length === 0) buckets.delete(key);
  }
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const real = request.headers.get("x-real-ip");
  if (real) return real.trim();
  return "unknown";
}

export type RateLimitResult =
  | { ok: true; remaining: number }
  | { ok: false; retryAfter: number };

export function checkRateLimit(
  routeKey: string,
  ip: string,
  max: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now();
  sweep(now, windowMs);

  const key = `${routeKey}:${ip}`;
  const bucket = buckets.get(key) ?? { hits: [] };
  bucket.hits = bucket.hits.filter((t) => now - t < windowMs);

  if (bucket.hits.length >= max) {
    const oldest = bucket.hits[0];
    const retryAfter = Math.ceil((windowMs - (now - oldest)) / 1000);
    buckets.set(key, bucket);
    return { ok: false, retryAfter: Math.max(retryAfter, 1) };
  }

  bucket.hits.push(now);
  buckets.set(key, bucket);
  return { ok: true, remaining: max - bucket.hits.length };
}

export function rateLimitedResponse(retryAfter: number): Response {
  return new Response(
    JSON.stringify({
      error: "Estás escribiendo muy rápido. Esperá unos segundos.",
    }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Retry-After": String(retryAfter),
      },
    },
  );
}
