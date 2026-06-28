/** Rate limit entry stored per key */
interface RateLimitEntry {
  count: number;
  resetAt: number;
}

/**
 * In-memory rate limiter using a Map.
 * Suitable for single-instance deployments.
 * For multi-instance, replace with Upstash Redis.
 */
const store = new Map<string, RateLimitEntry>();

/** Clean up expired entries every 5 minutes */
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (entry.resetAt < now) {
      store.delete(key);
    }
  }
}, 5 * 60 * 1000);

/** Options for rate limit check */
interface RateLimitOptions {
  /** Unique identifier (e.g., IP, email) */
  key: string;
  /** Maximum number of requests allowed in the window */
  max: number;
  /** Window duration in milliseconds */
  windowMs: number;
}

/** Result of a rate limit check */
export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
}

/**
 * Checks if a request should be rate limited.
 * Increments the counter and returns the result.
 *
 * @param options - Key, max requests, and window duration
 * @returns Whether the request is allowed and remaining count
 */
export function checkRateLimit(options: RateLimitOptions): RateLimitResult {
  const { key, max, windowMs } = options;
  const now = Date.now();

  let entry = store.get(key);

  if (!entry || entry.resetAt < now) {
    entry = { count: 0, resetAt: now + windowMs };
    store.set(key, entry);
  }

  entry.count++;

  const allowed = entry.count <= max;
  const remaining = Math.max(0, max - entry.count);

  return {
    allowed,
    remaining,
    resetAt: new Date(entry.resetAt),
  };
}

/**
 * Resets the rate limit counter for a given key.
 * Called on successful operations to clear the counter.
 *
 * @param key - Rate limit key to reset
 */
export function resetRateLimit(key: string): void {
  store.delete(key);
}
