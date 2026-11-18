/**
 * @fileoverview India Central Pollution Control Board (CPCB) NAQI scale implementation.
 * Uses piecewise linear interpolation across official CPCB concentration breakpoints.
 * Citation: CPCB (2014) National Air Quality Index, MoEFCC, Government of India.
 */

import { INDIA_NAQI_BREAKPOINTS } from "@/domain/constants";
import type { AqiCategory, ComputedAqi } from "@/domain/types";
import type { AqiScale } from "./scale";

interface BreakpointBand {
  readonly minC: number;
  readonly maxC: number;
  readonly minI: number;
  readonly maxI: number;
}

const PM25_BANDS: readonly BreakpointBand[] = [
  { minC: 0, maxC: 30, minI: 0, maxI: 50 },
  { minC: 30, maxC: 60, minI: 51, maxI: 100 },
  { minC: 60, maxC: 90, minI: 101, maxI: 200 },
  { minC: 90, maxC: 120, minI: 201, maxI: 300 },
  { minC: 120, maxC: 250, minI: 301, maxI: 400 },
  { minC: 250, maxC: 500, minI: 401, maxI: 500 },
];

const PM10_BANDS: readonly BreakpointBand[] = [
  { minC: 0, maxC: 50, minI: 0, maxI: 50 },
  { minC: 50, maxC: 100, minI: 51, maxI: 100 },
  { minC: 100, maxC: 250, minI: 101, maxI: 200 },
  { minC: 250, maxC: 350, minI: 201, maxI: 300 },
  { minC: 350, maxC: 430, minI: 301, maxI: 400 },
  { minC: 430, maxC: 600, minI: 401, maxI: 500 },
];

/**
 * Calculates a single pollutant sub-index via linear interpolation.
 */
function interpolateSubIndex(conc: number, bands: readonly BreakpointBand[]): number {
  const safeConc = Math.max(0, conc);
  for (const band of bands) {
    if (safeConc <= band.maxC) {
      const slope = (band.maxI - band.minI) / (band.maxC - band.minC);
      return Math.round(band.minI + slope * (safeConc - band.minC));
    }
  }
  return 500;
}

function getLowerIndiaCategory(aqi: number): AqiCategory | null {
  if (aqi <= INDIA_NAQI_BREAKPOINTS.GOOD.maxAqi) {
    return {
      band: "GOOD",
      label: "Good",
      hindiLabel: "अच्छा",
      color:
        "text-emerald-700 bg-emerald-50 border-emerald-300 dark:text-emerald-300 dark:bg-emerald-950/60 dark:border-emerald-800",
      iconName: "Smile",
      generalAdvisory: "Minimal impact. Enjoy normal outdoor activities.",
    };
  }
  if (aqi <= INDIA_NAQI_BREAKPOINTS.SATISFACTORY.maxAqi) {
    return {
      band: "SATISFACTORY",
      label: "Satisfactory",
      hindiLabel: "संतोषजनक",
      color:
        "text-green-700 bg-green-50 border-green-300 dark:text-green-300 dark:bg-green-950/60 dark:border-green-800",
      iconName: "CheckCircle",
      generalAdvisory: "Minor breathing discomfort to sensitive individuals.",
    };
  }
  if (aqi <= INDIA_NAQI_BREAKPOINTS.MODERATE.maxAqi) {
    return {
      band: "MODERATE",
      label: "Moderate",
      hindiLabel: "मध्यम",
      color:
        "text-amber-800 bg-amber-50 border-amber-300 dark:text-amber-300 dark:bg-amber-950/60 dark:border-amber-800",
      iconName: "AlertTriangle",
      generalAdvisory: "Breathing discomfort to people with asthma, heart, or lung diseases.",
    };
  }
  return null;
}

function getHigherIndiaCategory(aqi: number): AqiCategory {
  if (aqi <= INDIA_NAQI_BREAKPOINTS.POOR.maxAqi) {
    return {
      band: "POOR",
      label: "Poor",
      hindiLabel: "खराब",
      color:
        "text-orange-800 bg-orange-50 border-orange-300 dark:text-orange-300 dark:bg-orange-950/60 dark:border-orange-800",
      iconName: "AlertOctagon",
      generalAdvisory: "Breathing discomfort to most people on prolonged outdoor exposure.",
    };
  }
  if (aqi <= INDIA_NAQI_BREAKPOINTS.VERY_POOR.maxAqi) {
    return {
      band: "VERY_POOR",
      label: "Very Poor",
      hindiLabel: "बहुत खराब",
      color:
        "text-rose-800 bg-rose-50 border-rose-300 dark:text-rose-300 dark:bg-rose-950/60 dark:border-rose-800",
      iconName: "ShieldAlert",
      generalAdvisory: "Respiratory illness on prolonged exposure. Sensitive groups stay indoors.",
    };
  }
  return {
    band: "SEVERE",
    label: "Severe",
    hindiLabel: "गंभीर",
    color:
      "text-red-950 bg-red-100 border-red-400 dark:text-red-200 dark:bg-red-950 dark:border-red-700",
    iconName: "Skull",
    generalAdvisory:
      "Seriously impacts healthy and diseased individuals alike. Avoid all outdoor exertion.",
  };
}

/**
 * Maps an index to India NAQI categories with localized Hindi terms and advisories.
 */
function getIndiaCategory(aqi: number): AqiCategory {
  const lower = getLowerIndiaCategory(aqi);
  if (lower) return lower;
  return getHigherIndiaCategory(aqi);
}

export class IndiaNaqiScale implements AqiScale {
  public readonly type = "INDIA_NAQI" as const;

  public compute(pm25: number, pm10?: number): ComputedAqi {
    const pm25SubIndex = interpolateSubIndex(pm25, PM25_BANDS);
    const pm10SubIndex = pm10 !== undefined ? interpolateSubIndex(pm10, PM10_BANDS) : 0;

    const value = Math.max(pm25SubIndex, pm10SubIndex);
    const dominantPollutant = pm10SubIndex > pm25SubIndex ? "pm10" : "pm2_5";
    const category = this.getCategory(value);

    return {
      value,
      scale: this.type,
      category,
      dominantPollutant,
      pm25,
      ...(pm10 !== undefined ? { pm10 } : {}),
    };
  }

  public getCategory(aqi: number): AqiCategory {
    return getIndiaCategory(aqi);
  }
}
