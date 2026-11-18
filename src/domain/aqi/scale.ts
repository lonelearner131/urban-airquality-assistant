/**
 * @fileoverview Strategy interface for Air Quality Index (AQI) calculations.
 * Different jurisdictions (CPCB India vs US EPA) use differing breakpoints,
 * equations, and categorization schemes. This interface unifies them behind
 * a polymorphic domain contract.
 */

import type { AqiCategory, AqiScaleType, ComputedAqi } from "@/domain/types";

export interface AqiScale {
  readonly type: AqiScaleType;
  /**
   * Computes the index value and assigns the appropriate category from particulate levels.
   *
   * @param pm25 - Fine particulate matter concentration in ug/m3.
   * @param pm10 - Coarse particulate matter concentration in ug/m3 (optional).
   * @returns Computed AQI entity with breakdown.
   */
  compute(pm25: number, pm10?: number): ComputedAqi;

  /**
   * Maps a numerical AQI index to its descriptive band and advisory.
   *
   * @param aqi - Numerical AQI value.
   * @returns Detailed category with labels, color tokens, and advisories.
   */
  getCategory(aqi: number): AqiCategory;
}
