import { describe, expect, it } from "vitest";
import { computeRiskAssessment, computeVulnerabilityMultiplier } from "@/domain/risk/riskTier";

describe("riskTier", () => {
  it("computes baseline multiplier (1.0) when no vulnerabilities present", () => {
    const mult = computeVulnerabilityMultiplier({
      hasChildren: false,
      hasElderly: false,
      hasPregnancy: false,
      hasRespiratoryCondition: false,
    });
    expect(mult).toBe(1.0);
  });

  it("accumulates vulnerability factors", () => {
    const mult = computeVulnerabilityMultiplier({
      hasChildren: true,
      hasElderly: true,
      hasPregnancy: false,
      hasRespiratoryCondition: false,
    });
    // 1.0 + 0.35 + 0.35 = 1.70
    expect(mult).toBe(1.7);
  });

  it("caps maximum vulnerability multiplier at 2.5", () => {
    const mult = computeVulnerabilityMultiplier({
      hasChildren: true,
      hasElderly: true,
      hasPregnancy: true,
      hasRespiratoryCondition: true,
    });
    // 1.0 + 0.35 + 0.35 + 0.45 + 0.55 = 2.7 -> capped at 2.5
    expect(mult).toBe(2.5);
  });

  it("classifies healthy individual with low AQI as LOW tier", () => {
    const assessment = computeRiskAssessment(60, {
      hasChildren: false,
      hasElderly: false,
      hasPregnancy: false,
      hasRespiratoryCondition: false,
    });
    expect(assessment.tier).toBe("LOW");
    expect(assessment.score).toBe(60);
    expect(assessment.vulnerableGroupsIdentified).toHaveLength(0);
  });

  it("classifies moderate AQI as MODERATE tier", () => {
    const assessment = computeRiskAssessment(150, {
      hasChildren: false,
      hasElderly: false,
      hasPregnancy: false,
      hasRespiratoryCondition: false,
    });
    expect(assessment.tier).toBe("MODERATE");
  });

  it("elevates risk tier when vulnerable members are present", () => {
    // AQI 120 (Moderate on its own), with pregnant + asthma -> 1.0 + 0.45 + 0.55 = 2.0x -> score 240 (HIGH)
    const assessment = computeRiskAssessment(120, {
      hasChildren: false,
      hasElderly: false,
      hasPregnancy: true,
      hasRespiratoryCondition: true,
    });
    expect(assessment.multiplier).toBe(2.0);
    expect(assessment.score).toBe(240);
    expect(assessment.tier).toBe("HIGH");
    expect(assessment.vulnerableGroupsIdentified).toContain("Expectant mother");
    expect(assessment.vulnerableGroupsIdentified).toContain("Asthma/respiratory history");
  });

  it("classifies severe conditions as SEVERE tier", () => {
    const assessment = computeRiskAssessment(360, {
      hasChildren: false,
      hasElderly: false,
      hasPregnancy: false,
      hasRespiratoryCondition: false,
    });
    expect(assessment.tier).toBe("SEVERE");
  });
});
