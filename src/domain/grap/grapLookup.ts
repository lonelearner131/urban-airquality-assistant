/**
 * @fileoverview Graded Response Action Plan (GRAP) lookup for Delhi-NCR.
 * Statutory mechanism enforced by the Commission for Air Quality Management (CAQM).
 * Citation: CAQM (2023 revised schedule) "Graded Response Action Plan for Delhi-NCR".
 */

import { DELHI_GRAP_STAGES } from "@/domain/constants";
import type { GrapAssessment, GrapStage } from "@/domain/types";

const DELHI_NCR_IDENTIFIERS = [
  "delhi",
  "new delhi",
  "noida",
  "greater noida",
  "gurugram",
  "gurgaon",
  "faridabad",
  "ghaziabad",
];

const OFFICIAL_CAQM_NOTE =
  "Official CAQM notice: GRAP stages are statutory orders implemented by CAQM and local authorities. Always verify current operative orders at caqm.nic.in.";

/**
 * Checks whether a location name or coordinates correspond to the Delhi-NCR metropolitan region.
 */
export function isDelhiNcrRegion(locationName: string, lat?: number, lon?: number): boolean {
  const normalized = locationName.toLowerCase();
  for (const identifier of DELHI_NCR_IDENTIFIERS) {
    if (normalized.includes(identifier)) return true;
  }
  if (lat !== undefined && lon !== undefined) {
    // Delhi-NCR approximate bounds: Lat 28.2 to 28.9, Lon 76.8 to 77.6
    return lat >= 28.2 && lat <= 28.9 && lon >= 76.8 && lon <= 77.6;
  }
  return false;
}

/**
 * Determines the GRAP stage based on numerical AQI.
 */
function resolveStage(aqi: number): GrapStage {
  if (aqi >= DELHI_GRAP_STAGES.STAGE_4_MIN_AQI) return 4;
  if (aqi >= DELHI_GRAP_STAGES.STAGE_3_MIN_AQI) return 3;
  if (aqi >= DELHI_GRAP_STAGES.STAGE_2_MIN_AQI) return 2;
  if (aqi >= DELHI_GRAP_STAGES.STAGE_1_MIN_AQI) return 1;
  return 0;
}

function getHighGrapActions(stage: 3 | 4): { title: string; summary: string; actions: string[] } {
  if (stage === 4) {
    return {
      title: "GRAP Stage IV ('Severe+' Air Quality)",
      summary: "Emergency measures in force. Strict curbs on vehicles and public activity.",
      actions: [
        "Avoid all outdoor exposure; wear N95/FFP2 masks if stepping out is unavoidable.",
        "Schooling moved online for younger children under CAQM orders.",
        "Private offices advised to operate at 50% physical capacity with WFH.",
        "Strict ban on older diesel transport vehicles and diesel generator sets.",
      ],
    };
  }
  return {
    title: "GRAP Stage III ('Severe' Air Quality)",
    summary: "Intensified mitigation to prevent AQI from entering emergency zone.",
    actions: [
      "Switch to public transport (Metro/CNG bus) instead of private motor vehicles.",
      "Non-essential construction and demolition activities are strictly prohibited.",
      "Keep vulnerable family members (infants, elderly) in air-purified rooms.",
    ],
  };
}

function getLowGrapActions(stage: 0 | 1 | 2): {
  title: string;
  summary: string;
  actions: string[];
} {
  if (stage === 2) {
    return {
      title: "GRAP Stage II ('Very Poor' Air Quality)",
      summary: "Preventive phase targeting diesel generators and localized dust.",
      actions: [
        "Use public transport; avoid single-occupancy personal vehicle commutes.",
        "Do not use coal or firewood for domestic or security heating; use electric heaters.",
        "Replace or vacuum pre-filters in residential air purifiers.",
      ],
    };
  }
  if (stage === 1) {
    return {
      title: "GRAP Stage I ('Poor' Air Quality)",
      summary: "Baseline action plan active to curb initial winter smog accumulation.",
      actions: [
        "Ensure valid Pollution Under Control (PUC) certificate for personal vehicles.",
        "Do not idle vehicle engine at traffic red lights.",
        "Report any open garbage or garden leaf burning to municipal authorities / RWA.",
      ],
    };
  }
  return {
    title: "GRAP Inactive",
    summary: "Air quality is currently below GRAP regulatory thresholds.",
    actions: ["Follow standard low-emission community guidelines."],
  };
}

/**
 * Provides citizen advisories corresponding to the active GRAP stage.
 */
function getGrapActions(stage: GrapStage): { title: string; summary: string; actions: string[] } {
  if (stage === 4 || stage === 3) return getHighGrapActions(stage);
  return getLowGrapActions(stage);
}

/**
 * Evaluates the statutory Delhi-NCR GRAP status for a given air quality reading.
 *
 * @param aqi - Numerical AQI.
 * @param locationName - Name of the user's city or locality.
 * @param lat - Latitude coordinate.
 * @param lon - Longitude coordinate.
 * @returns Complete GrapAssessment with statutory notes and actionable steps.
 */
export function evaluateDelhiGrap(
  aqi: number,
  locationName: string,
  lat?: number,
  lon?: number,
): GrapAssessment {
  const isApplicable = isDelhiNcrRegion(locationName, lat, lon);
  if (!isApplicable) {
    return {
      applicable: false,
      stage: 0,
      stageName: "Not Applicable",
      summary: "GRAP regulations apply specifically to the National Capital Region (Delhi-NCR).",
      citizenActions: [],
      officialVerificationNote: OFFICIAL_CAQM_NOTE,
    };
  }

  const stage = resolveStage(aqi);
  const info = getGrapActions(stage);

  return {
    applicable: true,
    stage,
    stageName: info.title,
    summary: info.summary,
    citizenActions: info.actions,
    officialVerificationNote: OFFICIAL_CAQM_NOTE,
  };
}
