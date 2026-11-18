import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { GET } from "@/app/api/geocode/route";
import { geocodeRateLimiter } from "@/lib/rateLimit";

describe("API /api/geocode", () => {
  it("returns 200 with results for valid query", async () => {
    const req = new NextRequest("http://localhost:3000/api/geocode?q=Delhi");
    const res = await GET(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(Array.isArray(json.results)).toBe(true);
  });

  it("returns 400 when query parameter is missing or too short", async () => {
    const req = new NextRequest("http://localhost:3000/api/geocode?q=a");
    const res = await GET(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.code).toBe("VALIDATION_ERROR");
  });

  it("handles rate limiting when quota is exhausted", async () => {
    const ip = "10.0.0.99";
    // Drain rate limit for this test IP
    for (let i = 0; i < 70; i++) {
      geocodeRateLimiter.consume(ip);
    }

    const req = new NextRequest("http://localhost:3000/api/geocode?q=Delhi", {
      headers: { "x-forwarded-for": ip },
    });
    const res = await GET(req);
    expect(res.status).toBe(429);
    const json = await res.json();
    expect(json.code).toBe("RATE_LIMIT_EXCEEDED");
  });
});
