import { describe, expect, it } from "vitest";
import { AirQualityService } from "@/services/airQuality";
import { airQualityCache } from "@/lib/cache";

describe("AirQualityService", () => {
  const fakePayload = {
    latitude: 28.61,
    longitude: 77.21,
    timezone: "Asia/Kolkata",
    current: {
      pm2_5: 180,
      pm10: 250,
      nitrogen_dioxide: 45,
      ozone: 20,
      us_aqi: 230,
    },
    hourly: {
      time: ["2026-11-18T00:00", "2026-11-18T01:00"],
      pm2_5: [180, 190],
      pm10: [250, 260],
      nitrogen_dioxide: [45, 50],
      ozone: [20, 22],
      us_aqi: [230, 240],
    },
  };

  it("fetches, parses, and caches air quality data", async () => {
    airQualityCache.clear();
    let networkCalls = 0;

    const fakeFetch: typeof fetch = async () => {
      networkCalls++;
      return new Response(JSON.stringify(fakePayload), { status: 200 });
    };

    const service = new AirQualityService(fakeFetch);
    const snap1 = await service.getAirQuality(28.61, 77.21);

    expect(snap1.currentPm25).toBe(180);
    expect(snap1.currentPm10).toBe(250);
    expect(networkCalls).toBe(1);

    // Second call for same rounded coords hits cache
    const snap2 = await service.getAirQuality(28.61, 77.21);
    expect(snap2.currentPm25).toBe(180);
    expect(networkCalls).toBe(1);
  });

  it("handles nulls in hourly series safely", async () => {
    airQualityCache.clear();
    const payloadWithNulls = {
      ...fakePayload,
      latitude: 28.5,
      longitude: 77.1,
      current: null,
      hourly: {
        time: ["2026-11-18T00:00", "2026-11-18T01:00"],
        pm2_5: [null, 95],
        pm10: [null, null],
        nitrogen_dioxide: [null],
        ozone: [null],
        us_aqi: [null, 150],
      },
    };

    const fakeFetch: typeof fetch = async () =>
      new Response(JSON.stringify(payloadWithNulls), { status: 200 });

    const service = new AirQualityService(fakeFetch);
    const snap = await service.getAirQuality(28.5, 77.1);

    expect(snap.currentPm25).toBeGreaterThanOrEqual(0);
    expect(snap.hourlyPm25[1]).toBe(95);
  });
});
