import { describe, expect, it } from "vitest";
import { extractHourFromIso, optimizeHourlyWindows } from "@/domain/windows/windowOptimizer";

describe("windowOptimizer", () => {
  const samplePoints = [
    { time: "2026-11-18T00:00:00Z", pm25: 180, aqi: 240 },
    { time: "2026-11-18T06:00:00Z", pm25: 250, aqi: 310 }, // morning peak
    { time: "2026-11-18T13:00:00Z", pm25: 80, aqi: 150 }, // cleanest
    { time: "2026-11-18T14:00:00Z", pm25: 85, aqi: 155 },
    { time: "2026-11-18T20:00:00Z", pm25: 220, aqi: 280 },
  ];

  it("extracts hour correctly from ISO strings", () => {
    expect(extractHourFromIso("2026-11-18T14:30:00Z")).toBe(
      new Date("2026-11-18T14:30:00Z").getHours(),
    );
    expect(extractHourFromIso("invalid-date")).toBe(0);
  });

  it("identifies cleanest and worst PM2.5 points", () => {
    const { recommendation, enrichedPoints } = optimizeHourlyWindows(samplePoints);

    expect(recommendation.cleanestPm25).toBe(80);
    expect(recommendation.worstPm25).toBe(250);

    const cleanestPoint = enrichedPoints.find((p) => p.isCleanest);
    expect(cleanestPoint?.pm25).toBe(80);

    const worstPoint = enrichedPoints.find((p) => p.isWorst);
    expect(worstPoint?.pm25).toBe(250);
  });

  it("discovers best contiguous window", () => {
    const { recommendation } = optimizeHourlyWindows(samplePoints);
    expect(recommendation.safeWindows.length).toBeGreaterThan(0);
    const window = recommendation.safeWindows[0];
    expect(window?.averagePm25).toBe(83); // (80 + 85) / 2 = 82.5 -> 83
  });

  it("handles single-point series without crash", () => {
    const single = [{ time: "2026-11-18T10:00:00Z", pm25: 100, aqi: 150 }];
    const { recommendation } = optimizeHourlyWindows(single);
    expect(recommendation.cleanestPm25).toBe(100);
    expect(recommendation.safeWindows).toHaveLength(0);
  });

  it("throws for empty input series", () => {
    expect(() => optimizeHourlyWindows([])).toThrow();
  });
});
