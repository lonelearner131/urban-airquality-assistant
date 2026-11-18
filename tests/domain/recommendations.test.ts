import { describe, expect, it } from "vitest";
import {
  calculateMitigationSavings,
  selectApplicableRules,
} from "@/domain/recommendations/ruleSelector";

describe("ruleSelector", () => {
  it("selects rules matching user with high AQI and children", () => {
    const result = selectApplicableRules({
      aqi: 280,
      vulnerabilities: {
        hasChildren: true,
        hasElderly: false,
        hasPregnancy: false,
        hasRespiratoryCondition: false,
      },
      commuteMode: "two-wheeler",
      cookingFuel: "lpg",
      purifierStatus: "none",
      budgetLevel: "low",
    });

    const ruleIds = result.rules.map((r) => r.id);
    expect(ruleIds).toContain("routine_shift_school_run");
    expect(ruleIds).toContain("routine_mask_commute");
    expect(ruleIds).toContain("indoor_diy_corsirosenthal");
    expect(ruleIds).toContain("indoor_timed_ventilation");
    expect(ruleIds).toContain("community_anti_waste_burning");

    expect(result.grouped["routine"]).toBeDefined();
    expect(result.grouped["indoor"]).toBeDefined();
    expect(result.grouped["sustainable"]).toBeDefined();
    expect(result.grouped["community"]).toBeDefined();
  });

  it("filters out rules when AQI is low or condition is not met", () => {
    const result = selectApplicableRules({
      aqi: 40,
      vulnerabilities: {
        hasChildren: false,
        hasElderly: false,
        hasPregnancy: false,
        hasRespiratoryCondition: false,
      },
      commuteMode: "wfh",
      cookingFuel: "induction",
      purifierStatus: "hepa",
      budgetLevel: "flexible",
    });

    const ruleIds = result.rules.map((r) => r.id);
    expect(ruleIds).not.toContain("routine_shift_school_run");
    expect(ruleIds).not.toContain("routine_mask_commute");
    expect(ruleIds).not.toContain("indoor_diy_corsirosenthal");
  });

  it("filters rules by budget level and purifier status", () => {
    const result = selectApplicableRules({
      aqi: 200,
      vulnerabilities: {
        hasChildren: false,
        hasElderly: false,
        hasPregnancy: false,
        hasRespiratoryCondition: false,
      },
      commuteMode: "car",
      cookingFuel: "induction",
      purifierStatus: "hepa",
      budgetLevel: "flexible",
    });

    const ruleIds = result.rules.map((r) => r.id);
    expect(ruleIds).toContain("indoor_bedroom_purifier");
    expect(ruleIds).not.toContain("indoor_diy_corsirosenthal");
  });

  it("calculates emissions mitigation savings across selected rules", () => {
    const savings = calculateMitigationSavings([
      {
        id: "r1",
        category: "sustainable",
        title: "Metro",
        titleHindi: "मेट्रो",
        description: "Ride metro",
        descriptionHindi: "मेट्रो का उपयोग",
        effort: "low",
        exposureReductionPct: 40,
        emissionSavedKgCo2: 2.4,
        citation: "IPCC",
        conditions: {},
      },
      {
        id: "r2",
        category: "sustainable",
        title: "Induction",
        titleHindi: "इंडक्शन",
        description: "Cook induction",
        descriptionHindi: "इंडक्शन कुकिंग",
        effort: "flexible",
        exposureReductionPct: 30,
        emissionSavedKgCo2: 1.8,
        citation: "WHO",
        conditions: {},
      },
    ]);

    expect(savings).toBe(4.2);
  });
});
