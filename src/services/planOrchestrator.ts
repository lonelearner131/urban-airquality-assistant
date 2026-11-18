/**
 * @fileoverview Main orchestrator service implementing the hybrid "Rules Compute, AI Explains" pipeline.
 * Runs deterministic domain calculations, coordinates upstream APIs, and enriches results
 * with Gemini structured narration or robust fallback rules.
 */

import { selectAqiScale } from "@/domain/aqi/selectScale";
import { modelExposure } from "@/domain/exposure/exposureModel";
import { evaluateDelhiGrap } from "@/domain/grap/grapLookup";
import { selectApplicableRules } from "@/domain/recommendations/ruleSelector";
import { computeRiskAssessment } from "@/domain/risk/riskTier";
import type {
  ComputedAqi,
  ExposureEstimate,
  RecommendationRule,
  WindowRecommendation,
} from "@/domain/types";
import { optimizeHourlyWindows } from "@/domain/windows/windowOptimizer";
import type { AiNarrative, CompletePlan } from "@/schemas/plan";
import type { Profile } from "@/schemas/profile";
import { type AirQualityService, airQualityService } from "./airQuality";
import type { ContentGenerator } from "./gemini";
import { generateAiPlanNarrative } from "./gemini";
import type { IAirQualityService, IPlanOrchestrator } from "./types";

function buildHindiNarrative(
  location: string,
  aqi: number,
  tier: string,
  cleanWindow: string,
  pctReduction: number,
): AiNarrative {
  return {
    headline: `${location} के लिए वायु गुणवत्ता सुरक्षा योजना (AQI ${aqi} - ${tier})`,
    plainSummary: `आपके क्षेत्र में प्रदूषण स्तर ${aqi} है। यह कार्ययोजना आपके परिवार के श्वसन जोखिम को ${pctReduction}% तक कम करने के लिए तैयार की गई है।`,
    timelineSteps: [
      {
        timeSlot: "morning",
        title: "सुबह का समय",
        instruction: "सुबह के समय खिड़कियां बंद रखें और N95 मास्क पहनें।",
      },
      {
        timeSlot: "afternoon",
        title: "दोपहर का समय",
        instruction: `सबसे साफ समय (${cleanWindow}) में 15 मिनट के लिए वेंटिलेट करें।`,
      },
      {
        timeSlot: "evening",
        title: "शाम व रात",
        instruction: "सोने से पूर्व बेडरूम का दरवाजा बंद रखें और एयर प्यूरीफायर चालू करें।",
      },
    ],
    indoorHacksNarrative: ["गीले पोछे से सफाई करें", "खाना बनाते समय एग्जॉस्ट चलाएं"],
    sustainableAlternativesNarrative: ["निजी वाहन के स्थान पर मेट्रो का उपयोग करें", "इंडक्शन कुकिंग अपनाएं"],
    communityAdvisoryNarrative: "आसपास कूड़ा जलाने की घटनाओं को RWA और नगर निगम में तुरंत रिपोर्ट करें।",
    impactExplainedSimply: `इस योजना का पालन करने से दैनिक प्रदूषण एक्सपोजर में ${pctReduction}% की कमी आएगी।`,
  };
}

function buildEnglishTimeline(cleanWindow: string) {
  return [
    {
      timeSlot: "morning" as const,
      title: "Morning Rush",
      instruction:
        "Keep windows sealed during dawn smog peaks. Wear a fitted N95 respirator outdoors.",
    },
    {
      timeSlot: "afternoon" as const,
      title: "Midday Window",
      instruction: `Safely ventilate living areas during the cleanest daytime window (${cleanWindow}).`,
    },
    {
      timeSlot: "evening" as const,
      title: "Evening & Sleep",
      instruction:
        "Seal bedroom and operate HEPA/box-fan filtration overnight to restore clean air.",
    },
  ];
}

function buildEnglishNarrative(
  location: string,
  aqi: number,
  tier: string,
  cleanWindow: string,
  pctReduction: number,
): AiNarrative {
  return {
    headline: `Actionable Smog Shield Plan for ${location} (AQI ${aqi} - ${tier})`,
    plainSummary: `Ambient air quality is currently ${aqi} (${tier} risk). Following this targeted schedule reduces personal inhaled particulate dose by ${pctReduction}%.`,
    timelineSteps: buildEnglishTimeline(cleanWindow),
    indoorHacksNarrative: [
      "Wet-mop floors instead of dry broom sweeping to avoid aerosol resuspension.",
      "Seal door sweeps and window gaps.",
    ],
    sustainableAlternativesNarrative: [
      "Switch personal vehicle trips to electrified Metro transit.",
      "Adopt electric induction cooking.",
    ],
    communityAdvisoryNarrative:
      "Coordinate with neighborhood RWA to enforce zero open waste burning and organize school van pools.",
    impactExplainedSimply: `By applying filtration, timing ventilation, and wearing N95 masks, you reduce your daily inhaled PM2.5 dose by ${pctReduction}%.`,
  };
}

function buildDeterministicNarrative(
  location: string,
  aqi: number,
  tier: string,
  cleanWindow: string,
  lang: "en" | "hi",
  pctReduction: number,
): AiNarrative {
  return lang === "hi"
    ? buildHindiNarrative(location, aqi, tier, cleanWindow, pctReduction)
    : buildEnglishNarrative(location, aqi, tier, cleanWindow, pctReduction);
}

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
        vulnerableGroups: [],
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

  private buildHourlyWindows(aq: Awaited<ReturnType<IAirQualityService["getAirQuality"]>>) {
    const rawHourly = aq.hourlyTimes.map((time, i) => ({
      time,
      pm25: aq.hourlyPm25[i] ?? 25,
      aqi: aq.hourlyUsAqi[i] ?? 100,
    }));
    return optimizeHourlyWindows(rawHourly);
  }

  private assemblePlan(
    profile: Profile,
    computedAqi: ComputedAqi,
    risk: ReturnType<typeof computeRiskAssessment>,
    windows: WindowRecommendation,
    hourlyPoints: ReturnType<typeof optimizeHourlyWindows>["enrichedPoints"],
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
      riskAssessment: risk,
      windows,
      hourlyPoints,
      exposure,
      grap,
      selectedRules,
      aiNarrative,
      isAiGenerated,
    };
  }

  private extractDomainRules(profile: Profile, aqiValue: number) {
    return selectApplicableRules({
      aqi: aqiValue,
      vulnerabilities: profile.household,
      commuteMode: profile.commuteMode,
      cookingFuel: profile.cookingFuel,
      purifierStatus: profile.ownsPurifier,
      budgetLevel: profile.budgetLevel,
    });
  }

  public async generatePlan(profile: Profile): Promise<CompletePlan> {
    const aq = await this.aqService.getAirQuality(profile.latitude, profile.longitude);
    const scale = selectAqiScale(profile.countryCode, profile.latitude, profile.longitude);
    const aqi = scale.compute(aq.currentPm25, aq.currentPm10);
    const risk = computeRiskAssessment(aqi.value, profile.household);
    const { recommendation: windows, enrichedPoints } = this.buildHourlyWindows(aq);
    const rules = this.extractDomainRules(profile, aqi.value);
    const exp = this.computeExposure(profile, aqi, windows, rules.totalCo2SavingsKg);
    const grap = evaluateDelhiGrap(
      aqi.value,
      profile.locationName,
      profile.latitude,
      profile.longitude,
    );
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

    return this.assemblePlan(
      profile,
      aqi,
      risk,
      windows,
      enrichedPoints,
      exp,
      grap,
      rules.rules,
      narrative,
      isAi,
    );
  }
}

export const planOrchestrator = new PlanOrchestrator();
