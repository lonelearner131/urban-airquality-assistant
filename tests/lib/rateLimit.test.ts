import { describe, expect, it } from "vitest";
import { TokenBucketRateLimiter } from "@/lib/rateLimit";

describe("TokenBucketRateLimiter", () => {
  it("allows consumption within bucket capacity", () => {
    const limiter = new TokenBucketRateLimiter({ capacity: 3, refillRatePerMinute: 60 });
    const ip = "192.168.1.1";

    expect(limiter.consume(ip).allowed).toBe(true);
    expect(limiter.consume(ip).allowed).toBe(true);
    expect(limiter.consume(ip).allowed).toBe(true);
    // 4th request exceeds capacity
    const res = limiter.consume(ip);
    expect(res.allowed).toBe(false);
    expect(res.remaining).toBe(0);
    expect(res.resetSeconds).toBeGreaterThan(0);
  });

  it("purges stale records after maxAge", () => {
    const limiter = new TokenBucketRateLimiter({ capacity: 5, refillRatePerMinute: 10 });
    limiter.consume("client-a");
    limiter.purgeStale(-1000); // Forces purge of any record older than -1000ms from now
    // Next consume should be fresh
    expect(limiter.consume("client-a").remaining).toBe(4);
  });
});
