import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "@/app/api/plan/route";
import { planRateLimiter } from "@/lib/rateLimit";

describe("API /api/plan", () => {
  it("returns 400 when body fails Zod profile schema validation", async () => {
    const invalidBody = {
      locationName: "D", // too short
      latitude: 1000, // out of bounds
    };

    const req = new NextRequest("http://localhost:3000/api/plan", {
      method: "POST",
      body: JSON.stringify(invalidBody),
      headers: { "Content-Type": "application/json" },
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.code).toBe("VALIDATION_ERROR");
  });

  it("returns 429 when IP rate limit is exceeded", async () => {
    const ip = "10.0.0.88";
    for (let i = 0; i < 25; i++) {
      planRateLimiter.consume(ip);
    }

    const req = new NextRequest("http://localhost:3000/api/plan", {
      method: "POST",
      body: JSON.stringify({}),
      headers: { "x-forwarded-for": ip },
    });

    const res = await POST(req);
    expect(res.status).toBe(429);
  });
});
