/**
 * @fileoverview Risk tier computation combining environmental AQI with clinical vulnerabilities.
 * Implements epidemiological multiplier models to generate personalized risk assessments.
 */

import { RISK_THRESHOLDS, VULNERABILITY_WEIGHTS } from "@/domain/constants";
import type { RiskAssessment, RiskTier } from "@/domain/types";

export interface HouseholdVulnerabilities {
  readonly hasChildren: boolean;
  readonly hasElderly: boolean;
  readonly hasPregnancy: boolean;
  readonly hasRespiratoryCondition: boolean;
}

/**
 * Calculates the aggregate vulnerability multiplier from household demographics.
 */
export function computeVulnerabilityMultiplier(vuln: HouseholdVulnerabilities): number {
  let multiplier = VULNERABILITY_WEIGHTS.BASELINE;
  if (vuln.hasChildren) multiplier += VULNERABILITY_WEIGHTS.CHILDREN;
  if (vuln.hasElderly) multiplier += VULNERABILITY_WEIGHTS.ELDERLY;
  if (vuln.hasPregnancy) multiplier += VULNERABILITY_WEIGHTS.PREGNANT;
  if (vuln.hasRespiratoryCondition) multiplier += VULNERABILITY_WEIGHTS.RESPIRATORY_CONDITION;

  return Math.min(VULNERABILITY_WEIGHTS.MAX_MULTIPLIER, Number(multiplier.toFixed(2)));
}

/**
 * Identifies vulnerable groups as human-readable strings.
 */
function listVulnerableGroups(vuln: HouseholdVulnerabilities): string[] {
  const groups: string[] = [];
  if (vuln.hasChildren) groups.push("Children");
  if (vuln.hasElderly) groups.push("Elderly members");
  if (vuln.hasPregnancy) groups.push("Expectant mother");
  if (vuln.hasRespiratoryCondition) groups.push("Asthma/respiratory history");
  return groups;
}

/**
 * Classifies effective score into risk tiers.
 */
function classifyScoreToTier(score: number): RiskTier {
  if (score < RISK_THRESHOLDS.MODERATE_MIN_SCORE) return "LOW";
  if (score < RISK_THRESHOLDS.HIGH_MIN_SCORE) return "MODERATE";
  if (score < RISK_THRESHOLDS.SEVERE_MIN_SCORE) return "HIGH";
  return "SEVERE";
}

/**
 * Builds bilingual risk rationale strings.
 */
function createRiskRationale(
  tier: RiskTier,
  multiplier: number,
  groups: readonly string[],
): { en: string; hi: string } {
  if (groups.length === 0) {
    return {
      en: `Standard adult risk profile (Tier: ${tier}). No heightened personal vulnerabilities reported.`,
      hi: `सामान्य वयस्क जोखिम प्रोफ़ाइल (स्तर: ${tier})। कोई विशेष स्वास्थ्य संवेदनशीलता दर्ज नहीं।`,
    };
  }
  const groupList = groups.join(", ");
  return {
    en: `Elevated risk due to presence of: ${groupList}. Exposure multiplier: ${multiplier}x.`,
    hi: `उच्च जोखिम क्योंकि परिवार में शामिल हैं: ${groupList}। जोखिम गुणक: ${multiplier}x।`,
  };
}

/**
 * Evaluates the personalized risk assessment for a household.
 *
 * @param aqi - Environmental AQI value.
 * @param vuln - Demographic and medical vulnerability indicators.
 * @returns Fully computed RiskAssessment.
 */
export function computeRiskAssessment(aqi: number, vuln: HouseholdVulnerabilities): RiskAssessment {
  const multiplier = computeVulnerabilityMultiplier(vuln);
  const effectiveScore = Math.round(aqi * multiplier);
  const tier = classifyScoreToTier(effectiveScore);
  const groups = listVulnerableGroups(vuln);
  const rationale = createRiskRationale(tier, multiplier, groups);

  return {
    tier,
    score: effectiveScore,
    multiplier,
    rationale: rationale.en,
    rationaleHindi: rationale.hi,
    vulnerableGroupsIdentified: groups,
  };
}
