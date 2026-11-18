import { describe, expect, it } from "vitest";
import { PlanOrchestrator } from "@/services/planOrchestrator";
import { AirQualityService } from "@/services/airQuality";
import type { Profile } from "@/schemas/profile";

describe("PlanOrchestrator", () => {
  const fakeSnapshot = {
    latitude: 28.61,
    longitude: 77.21,
    timezone: "UTC",
    currentPm25: 160,
    currentPm10: 240,
    currentNo2: 30,
    currentO3: 40,
    currentUsAqi: 210,
    hourlyTimes: [
      "2026-11-18T00:00:00Z",
      "2026-11-18T06:00:00Z",
      "2026-11-18T12:00:00Z",
      "2026-11-18T18:00:00Z",
    ],
    hourlyPm25: [160, 220, 70, 180],
    hourlyPm10: [240, 300, 120, 260],
    hourlyUsAqi: [210, 270, 155, 230],
  };

  const sampleProfile: Profile = {
    locationName: "New Delhi",
    countryCode: "IN",
    latitude: 28.61,
    longitude: 77.21,
    household: {
      hasChildren: true,
      hasElderly: false,
      hasPregnancy: false,
      hasRespiratoryCondition: false,
    },
    commuteMode: "two-wheeler",
    commuteHoursPerDay: 2,
    cookingFuel: "lpg",
    heatingMethod: "none",
    ownsPurifier: "none",
    ventilationHabit: "open",
    budgetLevel: "low",
    outdoorRoutine: {
      hasSchoolRun: true,
      morningWalk: false,
      vigorousExercise: false,
    },
    preferredLanguage: "en",
  };

  it("orchestrates full deterministic plan when AI is not configured", async () => {
    const fakeAqService = {
      getAirQuality: async () => fakeSnapshot,
    } as unknown as AirQualityService;

    const orchestrator = new PlanOrchestrator(fakeAqService);
    const plan = await orchestrator.generatePlan(sampleProfile);

    expect(plan.locationName).toBe("New Delhi");
    expect(plan.computedAqi.value).toBeGreaterThan(0);
    expect(plan.computedAqi.scale).toBe("INDIA_NAQI");
    expect(plan.riskAssessment.tier).toBeDefined();
    expect(plan.exposure.reductionPct).toBeGreaterThan(0);
    expect(plan.grap.applicable).toBe(true);
    expect(plan.selectedRules.length).toBeGreaterThan(0);
    expect(plan.isAiGenerated).toBe(false);
    expect(plan.aiNarrative.timelineSteps).toHaveLength(3);
  });

  it("orchestrates localized plan in Hindi", async () => {
    const fakeAqService = {
      getAirQuality: async () => fakeSnapshot,
    } as unknown as AirQualityService;

    const orchestrator = new PlanOrchestrator(fakeAqService);
    const hindiProfile: Profile = { ...sampleProfile, preferredLanguage: "hi" };
    const plan = await orchestrator.generatePlan(hindiProfile);

    expect(plan.language).toBe("hi");
    expect(plan.aiNarrative.headline).toContain("योजना");
  });
});
