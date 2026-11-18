/**
 * @fileoverview US Environmental Protection Agency (EPA) AQI scale implementation.
 * Uses piecewise linear interpolation based on EPA PM2.5 breakpoint standards.
 * Citation: US EPA (2024) Technical Assistance Document for Daily Air Quality Reporting.
 */

import { US_EPA_BREAKPOINTS } from "@/domain/constants";
import type { AqiCategory, ComputedAqi } from "@/domain/types";
import type { AqiScale } from "./scale";

interface EpaBand {
  readonly minC: number;
  readonly maxC: number;
  readonly minI: number;
  readonly maxI: number;
}

const EPA_PM25_BANDS: readonly EpaBand[] = [
  { minC: 0.0, maxC: 12.0, minI: 0, maxI: 50 },
  { minC: 12.1, maxC: 35.4, minI: 51, maxI: 100 },
  { minC: 35.5, maxC: 55.4, minI: 101, maxI: 150 },
  { minC: 55.5, maxC: 150.4, minI: 151, maxI: 200 },
  { minC: 150.5, maxC: 250.4, minI: 201, maxI: 300 },
  { minC: 250.5, maxC: 500.4, minI: 301, maxI: 500 },
];

/**
 * Calculates US EPA AQI sub-index via linear interpolation.
 */
function interpolateEpaIndex(conc: number): number {
  const safeConc = Math.max(0, conc);
  for (const band of EPA_PM25_BANDS) {
    if (safeConc <= band.maxC) {
      const slope = (band.maxI - band.minI) / (band.maxC - band.minC);
      return Math.round(band.minI + slope * (safeConc - band.minC));
    }
  }
  return 500;
}

function getLowerEpaCategory(aqi: number): AqiCategory | null {
  if (aqi <= US_EPA_BREAKPOINTS.GOOD.maxAqi) {
    return {
      band: "GOOD",
      label: "Good",
      hindiLabel: "अच्छा",
      color:
        "text-emerald-700 bg-emerald-50 border-emerald-300 dark:text-emerald-300 dark:bg-emerald-950/60 dark:border-emerald-800",
      iconName: "Smile",
      generalAdvisory: "Air quality is satisfactory and poses little or no risk.",
    };
  }
  if (aqi <= US_EPA_BREAKPOINTS.MODERATE.maxAqi) {
    return {
      band: "MODERATE",
      label: "Moderate",
      hindiLabel: "मध्यम",
      color:
        "text-amber-800 bg-amber-50 border-amber-300 dark:text-amber-300 dark:bg-amber-950/60 dark:border-amber-800",
      iconName: "AlertTriangle",
      generalAdvisory: "Acceptable quality; sensitive individuals may experience mild effects.",
    };
  }
  return null;
}

function getHigherEpaCategory(aqi: number): AqiCategory {
  if (aqi <= US_EPA_BREAKPOINTS.UNHEALTHY_SENSITIVE.maxAqi) {
    return {
      band: "POOR",
      label: "Unhealthy for Sensitive Groups",
      hindiLabel: "संवेदनशील समूहों के लिए अस्वस्थ",
      color:
        "text-orange-800 bg-orange-50 border-orange-300 dark:text-orange-300 dark:bg-orange-950/60 dark:border-orange-800",
      iconName: "AlertOctagon",
      generalAdvisory:
        "Children, elderly, and individuals with respiratory conditions should limit prolonged exertion.",
    };
  }
  if (aqi <= US_EPA_BREAKPOINTS.UNHEALTHY.maxAqi) {
    return {
      band: "VERY_POOR",
      label: "Unhealthy",
      hindiLabel: "अस्वस्थ",
      color:
        "text-rose-800 bg-rose-50 border-rose-300 dark:text-rose-300 dark:bg-rose-950/60 dark:border-rose-800",
      iconName: "ShieldAlert",
      generalAdvisory:
        "Everyone may begin to experience health effects; sensitive groups experience more serious effects.",
    };
  }
  return {
    band: "HAZARDOUS",
    label: "Hazardous",
    hindiLabel: "खतरनाक",
    color:
      "text-purple-950 bg-purple-100 border-purple-400 dark:text-purple-200 dark:bg-purple-950 dark:border-purple-700",
    iconName: "Skull",
    generalAdvisory:
      "Health warning of emergency conditions. The entire population is likely to be affected.",
  };
}

/**
 * Maps an index to US EPA AQI categories with localized Hindi terms and advisories.
 */
function getEpaCategory(aqi: number): AqiCategory {
  const lower = getLowerEpaCategory(aqi);
  if (lower) return lower;
  return getHigherEpaCategory(aqi);
}

export class UsEpaScale implements AqiScale {
  public readonly type = "US_EPA" as const;

  public compute(pm25: number, pm10?: number): ComputedAqi {
    const value = interpolateEpaIndex(pm25);
    const category = this.getCategory(value);

    return {
      value,
      scale: this.type,
      category,
      dominantPollutant: "pm2_5",
      pm25,
      ...(pm10 !== undefined ? { pm10 } : {}),
    };
  }

  public getCategory(aqi: number): AqiCategory {
    return getEpaCategory(aqi);
  }
}
