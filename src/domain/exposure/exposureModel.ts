/**
 * @fileoverview Epidemiological particulate exposure dose model and what-if simulation.
 * Calculates baseline vs. with-plan PM2.5 respiratory intake using time-activity-microenvironment
 * equations and Berkeley Earth cigarette equivalence heuristics.
 */

import {
  ACTIVITY_VENTILATION_FACTORS,
  CIGARETTE_EQUIVALENCE,
  INDOOR_FILTRATION_FACTORS,
  MASK_FACTORS,
} from "@/domain/constants";
import type { ExposureEstimate } from "@/domain/types";

export interface ExposureContext {
  readonly outdoorPm25: number;
  readonly cleanestOutdoorPm25: number;
  readonly ownsPurifier: "none" | "hepa" | "diy";
  readonly ventilationHabit: "open" | "closed";
  readonly commuteHours: number;
  readonly outdoorExercise: boolean;
  readonly co2MitigationKg?: number;
}

interface DoseBreakdown {
  readonly sleepDose: number;
  readonly indoorActiveDose: number;
  readonly outdoorDose: number;
  readonly totalDose: number;
  readonly totalVentilationHours: number;
}

/**
 * Resolves indoor penetration factor based on purifier and window habits.
 */
function resolveIndoorFactor(
  purifier: "none" | "hepa" | "diy",
  ventilation: "open" | "closed",
): number {
  if (purifier === "hepa") return INDOOR_FILTRATION_FACTORS.HEPA_PURIFIER;
  if (purifier === "diy") return INDOOR_FILTRATION_FACTORS.DIY_PURIFIER;
  return ventilation === "open"
    ? INDOOR_FILTRATION_FACTORS.OPEN_VENTILATION
    : INDOOR_FILTRATION_FACTORS.CLOSED_NO_FILTER;
}

/**
 * Calculates integrated microenvironmental exposure dose (ug/m3 * hours * ventilation rate).
 */
function calculateDose(
  outdoorConc: number,
  indoorFactor: number,
  maskFactor: number,
  ctx: ExposureContext,
): DoseBreakdown {
  const indoorConc = outdoorConc * indoorFactor;
  const effectiveOutdoorConc = outdoorConc * maskFactor;

  const sleepHours = 8;
  const outdoorHours = Math.min(6, Math.max(0.5, ctx.commuteHours + (ctx.outdoorExercise ? 1 : 0)));
  const indoorActiveHours = Math.max(0, 24 - sleepHours - outdoorHours);

  const outdoorVentFactor = ctx.outdoorExercise
    ? ACTIVITY_VENTILATION_FACTORS.VIGOROUS_OUTDOOR
    : ACTIVITY_VENTILATION_FACTORS.COMMUTE_OR_WALK;

  const sleepDose = indoorConc * sleepHours * ACTIVITY_VENTILATION_FACTORS.SLEEP;
  const indoorActiveDose =
    indoorConc * indoorActiveHours * ACTIVITY_VENTILATION_FACTORS.LIGHT_INDOOR;
  const outdoorDose = effectiveOutdoorConc * outdoorHours * outdoorVentFactor;

  const totalDose = sleepDose + indoorActiveDose + outdoorDose;
  const totalVentHours =
    sleepHours * ACTIVITY_VENTILATION_FACTORS.SLEEP +
    indoorActiveHours * ACTIVITY_VENTILATION_FACTORS.LIGHT_INDOOR +
    outdoorHours * outdoorVentFactor;

  return {
    sleepDose,
    indoorActiveDose,
    outdoorDose,
    totalDose,
    totalVentilationHours: totalVentHours,
  };
}

/**
 * Converts average PM2.5 concentration dose into cigarette equivalence.
 */
function toCigarettes(dose: DoseBreakdown): number {
  const avg24hConc = dose.totalDose / dose.totalVentilationHours;
  const cigarettes = avg24hConc / CIGARETTE_EQUIVALENCE.UG_M3_PER_CIGARETTE;
  return Number(cigarettes.toFixed(1));
}

/**
 * Models personal respiratory particulate exposure before and after adopting recommendations.
 *
 * @param ctx - Microenvironment parameters, routine, and habits.
 * @returns Quantified baseline and with-plan exposure, % reduction, and cigarette equivalence.
 */
export function modelExposure(ctx: ExposureContext): ExposureEstimate {
  const baseIndoorFactor = resolveIndoorFactor(ctx.ownsPurifier, ctx.ventilationHabit);
  const baselineDose = calculateDose(ctx.outdoorPm25, baseIndoorFactor, MASK_FACTORS.NONE, ctx);

  // With-plan: HEPA or DIY purifier active, windows timed, fitted N95 worn during commute
  const planPurifier = ctx.ownsPurifier === "hepa" ? "hepa" : "diy";
  const planIndoorFactor = resolveIndoorFactor(planPurifier, "closed");
  const planOutdoorConc = Math.min(ctx.outdoorPm25, ctx.cleanestOutdoorPm25 * 1.15);
  const planDose = calculateDose(
    planOutdoorConc,
    planIndoorFactor,
    MASK_FACTORS.N95_FFP2_FITTED,
    ctx,
  );

  const reductionPct = Math.max(
    0,
    Math.round(((baselineDose.totalDose - planDose.totalDose) / baselineDose.totalDose) * 100),
  );

  return {
    baselineUgM3h: Math.round(baselineDose.totalDose),
    withPlanUgM3h: Math.round(planDose.totalDose),
    reductionPct,
    baselineCigarettesDay: toCigarettes(baselineDose),
    withPlanCigarettesDay: toCigarettes(planDose),
    co2SavedKg: Number((ctx.co2MitigationKg ?? 0).toFixed(2)),
  };
}
