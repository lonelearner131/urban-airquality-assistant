/**
 * @fileoverview Zod schemas for AI-narrated plan and complete orchestrator outputs.
 * Enforces structured schema adherence on Gemini responses and binds with domain engine results.
 */

import { z } from "zod";
import type {
  ComputedAqi,
  ExposureEstimate,
  GrapAssessment,
  HourlyPoint,
  RecommendationRule,
  RiskAssessment,
  WindowRecommendation,
} from "@/domain/types";

export const AiPlanStepSchema = z.object({
  timeSlot: z.enum(["morning", "afternoon", "evening"]),
  title: z.string().min(3).max(100),
  instruction: z.string().min(10).max(300),
  referencedRuleId: z.string().optional(),
});

export type AiPlanStep = z.infer<typeof AiPlanStepSchema>;

export const AiNarrativeSchema = z.object({
  headline: z.string().min(5).max(120),
  plainSummary: z.string().min(20).max(500),
  timelineSteps: z.array(AiPlanStepSchema).min(3),
  indoorHacksNarrative: z.array(z.string().min(10).max(250)),
  sustainableAlternativesNarrative: z.array(z.string().min(10).max(250)),
  communityAdvisoryNarrative: z.string().min(20).max(600),
  impactExplainedSimply: z.string().min(20).max(500),
});

export type AiNarrative = z.infer<typeof AiNarrativeSchema>;

export interface CompletePlan {
  readonly profileId: string;
  readonly locationName: string;
  readonly countryCode?: string;
  readonly lat: number;
  readonly lon: number;
  readonly language: "en" | "hi";
  readonly computedAqi: ComputedAqi;
  readonly riskAssessment: RiskAssessment;
  readonly windows: WindowRecommendation;
  readonly hourlyPoints: readonly HourlyPoint[];
  readonly exposure: ExposureEstimate;
  readonly grap: GrapAssessment;
  readonly selectedRules: readonly RecommendationRule[];
  readonly aiNarrative: AiNarrative;
  readonly isAiGenerated: boolean;
}
