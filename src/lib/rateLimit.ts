/**
 * @fileoverview In-memory token-bucket rate limiter for API endpoints.
 * Protects endpoints against denial-of-service and unauthorized rapid scraping.
 * Note: In distributed multi-region deployments, swap this with Upstash Redis or Vercel KV.
 */

interface BucketEntry {
  tokens: number;
  lastRefill: number;
}

export interface RateLimitConfig {
  readonly capacity: number;
  readonly refillRatePerMinute: number;
}

export interface RateLimitResult {
  readonly allowed: boolean;
  readonly remaining: number;
  readonly resetSeconds: number;
}

export class TokenBucketRateLimiter {
  private readonly store = new Map<string, BucketEntry>();

  constructor(
    private readonly config: RateLimitConfig = { capacity: 30, refillRatePerMinute: 30 },
  ) {}

  /**
   * Refills tokens for an IP based on elapsed wall-clock time.
   */
  private refill(entry: BucketEntry, now: number): void {
    const elapsedMs = now - entry.lastRefill;
    const tokensToAdd = (elapsedMs / 60000) * this.config.refillRatePerMinute;
    if (tokensToAdd > 0) {
      entry.tokens = Math.min(this.config.capacity, entry.tokens + tokensToAdd);
      entry.lastRefill = now;
    }
  }

  /**
   * Attempts to consume 1 token for a client identifier.
   *
   * @param key - Client IP or session token.
   * @returns Rate limit status and remaining token count.
   */
  public consume(key: string): RateLimitResult {
    const now = Date.now();
    let entry = this.store.get(key);

    if (!entry) {
      entry = { tokens: this.config.capacity, lastRefill: now };
      this.store.set(key, entry);
    } else {
      this.refill(entry, now);
    }

    if (entry.tokens >= 1) {
      entry.tokens -= 1;
      return {
        allowed: true,
        remaining: Math.floor(entry.tokens),
        resetSeconds: Math.ceil(
          ((this.config.capacity - entry.tokens) / this.config.refillRatePerMinute) * 60,
        ),
      };
    }

    return {
      allowed: false,
      remaining: 0,
      resetSeconds: Math.ceil(((1 - entry.tokens) / this.config.refillRatePerMinute) * 60),
    };
  }

  /**
   * Cleans up stale entries to prevent memory leaks.
   */
  public purgeStale(maxAgeMs = 300000): void {
    const cutoff = Date.now() - maxAgeMs;
    for (const [key, entry] of this.store.entries()) {
      if (entry.lastRefill < cutoff) {
        this.store.delete(key);
      }
    }
  }
}

export const planRateLimiter = new TokenBucketRateLimiter({
  capacity: 20,
  refillRatePerMinute: 20,
});
export const chatRateLimiter = new TokenBucketRateLimiter({
  capacity: 15,
  refillRatePerMinute: 15,
});
export const geocodeRateLimiter = new TokenBucketRateLimiter({
  capacity: 60,
  refillRatePerMinute: 60,
});
