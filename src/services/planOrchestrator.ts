import { selectAqiScale } from "@/domain/aqi/selectScale";
import { modelExposure } from "@/domain/exposure/exposureModel";
import { evaluateDelhiGrap } from "@/domain/grap/grapLookup";
import {
  type RuleSelectionResult,
  selectApplicableRules,
} from "@/domain/recommendations/ruleSelector";
import { computeRiskAssessment } from "@/domain/risk/riskTier";
import type {
  ComputedAqi,
  ExposureEstimate,
  RecommendationRule,
  WindowRecommendation,
} from "@/domain/types";
import {
  type HourlyOptimizationResult,
  optimizeHourlyWindows,
} from "@/domain/windows/windowOptimizer";
import type { AiNarrative, CompletePlan } from "@/schemas/plan";
import type { Profile } from "@/schemas/profile";
import { type AirQualityService, airQualityService } from "./airQuality";
import {
  buildDeterministicNarrative,
  extractVulnerableGroupLabels,
} from "./fallbackNarrative";
import { type ContentGenerator, generateAiPlanNarrative } from "./gemini";
import type { IAirQualityService, IPlanOrchestrator } from "./types";

export class PlanOrchestrator implements IPlanOrchestrator {
  constructor(
    private readonly aqService: AirQualityService = airQualityService,
    private readonly generator?: ContentGenerator,
  ) {}

  private computeExposure(
    profile: Profile,
    computedAqi: ComputedAqi,
    windows: WindowRecommendation,
    totalCo2SavingsKg: number,
  ): ExposureEstimate {
    return modelExposure({
      outdoorPm25: computedAqi.pm25,
      cleanestOutdoorPm25: windows.cleanestPm25,
      ownsPurifier: profile.ownsPurifier,
      ventilationHabit: profile.ventilationHabit === "open" ? "open" : "closed",
      commuteHours: profile.commuteHoursPerDay,
      outdoorExercise: profile.outdoorRoutine.vigorousExercise,
      co2MitigationKg: totalCo2SavingsKg,
    });
  }

  private async resolveNarrative(
    profile: Profile,
    computedAqi: ComputedAqi,
    tier: string,
    cleanWindowLabel: string,
    worstHour: number,
    rules: readonly RecommendationRule[],
    exposure: ExposureEstimate,
  ): Promise<{ narrative: AiNarrative; isAi: boolean }> {
    const aiNarrative = await generateAiPlanNarrative(
      {
        locationName: profile.locationName,
        aqi: computedAqi.value,
        aqiBand: computedAqi.category.label,
        riskTier: tier,
        vulnerableGroups: extractVulnerableGroupLabels(profile.household),
        cleanestTimeWindow: cleanWindowLabel,
        worstTimeWindow: `${worstHour}:00`,
        exposureReductionPct: exposure.reductionPct,
        cigaretteReduction: {
          from: exposure.baselineCigarettesDay,
          to: exposure.withPlanCigarettesDay,
        },
        selectedRuleIds: rules.map((r) => r.id),
        language: profile.preferredLanguage,
      },
      this.generator,
    );
    if (aiNarrative) return { narrative: aiNarrative, isAi: true };
    const fallback = buildDeterministicNarrative(
      profile.locationName,
      computedAqi.value,
      tier,
      cleanWindowLabel,
      profile.preferredLanguage,
      exposure.reductionPct,
    );
    return { narrative: fallback, isAi: false };
  }

  private buildHourlyWindows(
    aq: Awaited<ReturnType<IAirQualityService["getAirQuality"]>>,
  ): HourlyOptimizationResult {
    const rawHourly = aq.hourlyTimes.map((time, i) => ({
      time,
      pm25: aq.hourlyPm25[i] ?? 25,
      aqi: aq.hourlyUsAqi[i] ?? 100,
    }));
    return optimizeHourlyWindows(rawHourly);
  }

  private extractDomainRules(profile: Profile, aqiValue: number): RuleSelectionResult {
    return selectApplicableRules({
      aqi: aqiValue,
      vulnerabilities: profile.household,
      commuteMode: profile.commuteMode,
      cookingFuel: profile.cookingFuel,
      purifierStatus: profile.ownsPurifier,
      budgetLevel: profile.budgetLevel,
    });
  }

  private assemblePlan(
    profile: Profile,
    computedAqi: ComputedAqi,
    riskAssessment: ReturnType<typeof computeRiskAssessment>,
    windows: WindowRecommendation,
    hourlyPoints: HourlyOptimizationResult["enrichedPoints"],
    exposure: ExposureEstimate,
    grap: ReturnType<typeof evaluateDelhiGrap>,
    selectedRules: readonly RecommendationRule[],
    aiNarrative: AiNarrative,
    isAiGenerated: boolean,
  ): CompletePlan {
    return {
      profileId: `${profile.latitude}_${profile.longitude}_${Date.now()}`,
      locationName: profile.locationName,
      ...(profile.countryCode ? { countryCode: profile.countryCode } : {}),
      lat: profile.latitude,
      lon: profile.longitude,
      language: profile.preferredLanguage,
      computedAqi,
      riskAssessment,
      windows,
      hourlyPoints,
      exposure,
      grap,
      selectedRules,
      aiNarrative,
      isAiGenerated,
    };
  }

  public async generatePlan(profile: Profile): Promise<CompletePlan> {
    const aq = await this.aqService.getAirQuality(profile.latitude, profile.longitude);
    const scale = selectAqiScale(profile.countryCode, profile.latitude, profile.longitude);
    const aqi = scale.compute(aq.currentPm25, aq.currentPm10);
    const risk = computeRiskAssessment(aqi.value, profile.household);
    const { recommendation: windows, enrichedPoints } = this.buildHourlyWindows(aq);
    const rules = this.extractDomainRules(profile, aqi.value);
    const exp = this.computeExposure(profile, aqi, windows, rules.totalCo2SavingsKg);
    const grap = evaluateDelhiGrap(aqi.value, profile.locationName, profile.latitude, profile.longitude);
    const cleanWin = windows.safeWindows[0]?.label ?? `${windows.cleanestHour}:00`;
    const { narrative, isAi } = await this.resolveNarrative(
      profile,
      aqi,
      risk.tier,
      cleanWin,
      windows.worstHour,
      rules.rules,
      exp,
    );
    return this.assemblePlan(profile, aqi, risk, windows, enrichedPoints, exp, grap, rules.rules, narrative, isAi);
  }
}

export const planOrchestrator = new PlanOrchestrator();
