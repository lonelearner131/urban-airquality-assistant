import { describe, expect, it } from "vitest";
import { modelExposure } from "@/domain/exposure/exposureModel";

describe("exposureModel", () => {
  it("models reduction when applying plan under high pollution", () => {
    const res = modelExposure({
      outdoorPm25: 250,
      cleanestOutdoorPm25: 90,
      ownsPurifier: "none",
      ventilationHabit: "open",
      commuteHours: 2,
      outdoorExercise: false,
      co2MitigationKg: 2.4,
    });

    expect(res.baselineUgM3h).toBeGreaterThan(res.withPlanUgM3h);
    expect(res.reductionPct).toBeGreaterThan(60);
    expect(res.baselineCigarettesDay).toBeGreaterThan(res.withPlanCigarettesDay);
    expect(res.co2SavedKg).toBe(2.4);
  });

  it("handles user already owning a HEPA purifier", () => {
    const res = modelExposure({
      outdoorPm25: 150,
      cleanestOutdoorPm25: 60,
      ownsPurifier: "hepa",
      ventilationHabit: "closed",
      commuteHours: 1,
      outdoorExercise: false,
    });

    expect(res.reductionPct).toBeGreaterThanOrEqual(0);
    expect(res.withPlanCigarettesDay).toBeLessThanOrEqual(res.baselineCigarettesDay);
  });

  it("accounts for vigorous outdoor exercise increasing dose", () => {
    const sedentary = modelExposure({
      outdoorPm25: 200,
      cleanestOutdoorPm25: 80,
      ownsPurifier: "none",
      ventilationHabit: "closed",
      commuteHours: 1,
      outdoorExercise: false,
    });

    const runner = modelExposure({
      outdoorPm25: 200,
      cleanestOutdoorPm25: 80,
      ownsPurifier: "none",
      ventilationHabit: "closed",
      commuteHours: 1,
      outdoorExercise: true,
    });

    expect(runner.baselineUgM3h).toBeGreaterThan(sedentary.baselineUgM3h);
  });
});
