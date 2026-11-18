/**
 * @fileoverview Core domain types for SmogShield.
 * Represents purely immutable data structures used across domain calculations,
 * deterministic rules, and AI narration contexts.
 */

export type AqiScaleType = "INDIA_NAQI" | "US_EPA";

export type AqiBand =
  "GOOD" | "SATISFACTORY" | "MODERATE" | "POOR" | "VERY_POOR" | "SEVERE" | "HAZARDOUS";

export interface AqiCategory {
  readonly band: AqiBand;
  readonly label: string;
  readonly hindiLabel: string;
  readonly color: string;
  readonly iconName: string;
  readonly generalAdvisory: string;
}

export interface ComputedAqi {
  readonly value: number;
  readonly scale: AqiScaleType;
  readonly category: AqiCategory;
  readonly dominantPollutant: "pm2_5" | "pm10";
  readonly pm25: number;
  readonly pm10?: number;
  readonly no2?: number;
  readonly o3?: number;
}

export type RiskTier = "LOW" | "MODERATE" | "HIGH" | "SEVERE";

export interface RiskAssessment {
  readonly tier: RiskTier;
  readonly score: number;
  readonly multiplier: number;
  readonly rationale: string;
  readonly rationaleHindi: string;
  readonly vulnerableGroupsIdentified: readonly string[];
}

export type GrapStage = 0 | 1 | 2 | 3 | 4;

export interface GrapAssessment {
  readonly applicable: boolean;
  readonly stage: GrapStage;
  readonly stageName: string;
  readonly summary: string;
  readonly citizenActions: readonly string[];
  readonly officialVerificationNote: string;
}

export interface HourlyPoint {
  readonly isoTime: string;
  readonly hour: number;
  readonly pm25: number;
  readonly aqi: number;
  readonly isCleanest: boolean;
  readonly isWorst: boolean;
}

export interface SafeWindow {
  readonly startHour: number;
  readonly endHour: number;
  readonly label: string;
  readonly averagePm25: number;
}

export interface WindowRecommendation {
  readonly cleanestHour: number;
  readonly cleanestIsoTime: string;
  readonly cleanestPm25: number;
  readonly worstHour: number;
  readonly worstIsoTime: string;
  readonly worstPm25: number;
  readonly safeWindows: readonly SafeWindow[];
}

export interface ExposureEstimate {
  readonly baselineUgM3h: number;
  readonly withPlanUgM3h: number;
  readonly reductionPct: number;
  readonly baselineCigarettesDay: number;
  readonly withPlanCigarettesDay: number;
  readonly co2SavedKg: number;
}

export type RuleCategory = "routine" | "indoor" | "sustainable" | "community";

export type EffortCost = "free" | "low" | "flexible";

export interface RuleConditions {
  readonly minAqi?: number;
  readonly vulnerabilityRequired?: boolean;
  readonly commuteModes?: readonly string[];
  readonly cookingFuels?: readonly string[];
  readonly purifierStatus?: readonly string[];
  readonly ventilationTypes?: readonly string[];
  readonly budgetLevels?: readonly string[];
}

export interface RecommendationRule {
  readonly id: string;
  readonly category: RuleCategory;
  readonly title: string;
  readonly titleHindi: string;
  readonly description: string;
  readonly descriptionHindi: string;
  readonly effort: EffortCost;
  readonly exposureReductionPct: number;
  readonly emissionSavedKgCo2?: number;
  readonly citation: string;
  readonly conditions: RuleConditions;
}

export interface UserContextSummary {
  readonly locationName: string;
  readonly countryCode?: string;
  readonly lat: number;
  readonly lon: number;
  readonly aqi: number;
  readonly aqiScale: AqiScaleType;
  readonly riskTier: RiskTier;
  readonly grapStage: GrapStage;
  readonly language: "en" | "hi";
}
