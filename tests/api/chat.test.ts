import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "@/app/api/chat/route";
import { chatRateLimiter } from "@/lib/rateLimit";

describe("API /api/chat", () => {
  it("returns 400 for malformed or empty message payload", async () => {
    const req = new NextRequest("http://localhost:3000/api/chat", {
      method: "POST",
      body: JSON.stringify({ message: "" }),
      headers: { "Content-Type": "application/json" },
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.code).toBe("VALIDATION_ERROR");
  });

  it("returns 200 with reply for valid chat query", async () => {
    const validBody = {
      message: "Is it safe to go for a run right now?",
      context: {
        locationName: "New Delhi",
        aqi: 280,
        riskTier: "HIGH",
        summary: "Severe smog advisory",
        language: "en" as const,
      },
      history: [],
    };

    const req = new NextRequest("http://localhost:3000/api/chat", {
      method: "POST",
      body: JSON.stringify(validBody),
      headers: { "Content-Type": "application/json" },
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.reply).toBeDefined();
  });

  it("returns 429 when chat rate limit is exceeded", async () => {
    const ip = "10.0.0.77";
    for (let i = 0; i < 20; i++) {
      chatRateLimiter.consume(ip);
    }

    const req = new NextRequest("http://localhost:3000/api/chat", {
      method: "POST",
      body: JSON.stringify({
        message: "Is it safe to run?",
        context: {
          locationName: "Delhi",
          aqi: 250,
          riskTier: "High",
          summary: "High smog",
          language: "en",
        },
      }),
      headers: { "x-forwarded-for": ip },
    });

    const res = await POST(req);
    expect(res.status).toBe(429);
  });
});
