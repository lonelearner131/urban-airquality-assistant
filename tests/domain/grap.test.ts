import { describe, expect, it } from "vitest";
import { evaluateDelhiGrap, isDelhiNcrRegion } from "@/domain/grap/grapLookup";

describe("grapLookup", () => {
  it("identifies Delhi-NCR localities by name", () => {
    expect(isDelhiNcrRegion("New Delhi, India")).toBe(true);
    expect(isDelhiNcrRegion("Noida, Uttar Pradesh")).toBe(true);
    expect(isDelhiNcrRegion("Gurugram, Haryana")).toBe(true);
    expect(isDelhiNcrRegion("Faridabad")).toBe(true);
    expect(isDelhiNcrRegion("Mumbai")).toBe(false);
  });

  it("identifies Delhi-NCR by coordinates", () => {
    // Connaught Place: 28.63, 77.22
    expect(isDelhiNcrRegion("Unknown City", 28.63, 77.22)).toBe(true);
    // Bengaluru: 12.97, 77.59
    expect(isDelhiNcrRegion("Unknown City", 12.97, 77.59)).toBe(false);
  });

  it("returns not applicable for non-Delhi regions", () => {
    const res = evaluateDelhiGrap(350, "London", 51.5, -0.12);
    expect(res.applicable).toBe(false);
    expect(res.stage).toBe(0);
  });

  it("evaluates Stage 0 (Inactive) for AQI < 201 in Delhi", () => {
    const res = evaluateDelhiGrap(150, "Delhi");
    expect(res.applicable).toBe(true);
    expect(res.stage).toBe(0);
    expect(res.stageName).toContain("Inactive");
  });

  it("evaluates Stage 1 for AQI 201-300", () => {
    const res = evaluateDelhiGrap(250, "Delhi");
    expect(res.applicable).toBe(true);
    expect(res.stage).toBe(1);
    expect(res.stageName).toContain("Stage I");
    expect(res.citizenActions.length).toBeGreaterThan(0);
  });

  it("evaluates Stage 2 for AQI 301-400", () => {
    const res = evaluateDelhiGrap(350, "Delhi");
    expect(res.applicable).toBe(true);
    expect(res.stage).toBe(2);
    expect(res.stageName).toContain("Stage II");
  });

  it("evaluates Stage 3 for AQI 401-450", () => {
    const res = evaluateDelhiGrap(420, "Delhi");
    expect(res.applicable).toBe(true);
    expect(res.stage).toBe(3);
    expect(res.stageName).toContain("Stage III");
  });

  it("evaluates Stage 4 for AQI > 450", () => {
    const res = evaluateDelhiGrap(480, "Delhi");
    expect(res.applicable).toBe(true);
    expect(res.stage).toBe(4);
    expect(res.stageName).toContain("Stage IV");
  });
});
