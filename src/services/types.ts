/**
 * @fileoverview Service interfaces and dependency injection types.
 * Enables zero-mock testing by allowing fetch and clients to be injected cleanly.
 */

import type { GeocodeResultItem } from "@/schemas/airQuality";
import type { CompletePlan } from "@/schemas/plan";
import type { Profile } from "@/schemas/profile";

export interface AirQualitySnapshot {
  readonly latitude: number;
  readonly longitude: number;
  readonly timezone?: string | undefined;
  readonly currentPm25: number;
  readonly currentPm10?: number | undefined;
  readonly currentNo2?: number | undefined;
  readonly currentO3?: number | undefined;
  readonly currentUsAqi?: number | undefined;
  readonly hourlyTimes: readonly string[];
  readonly hourlyPm25: readonly number[];
  readonly hourlyPm10: readonly number[];
  readonly hourlyUsAqi: readonly number[];
}

export interface IGeocodingService {
  search(query: string): Promise<readonly GeocodeResultItem[]>;
}

export interface IAirQualityService {
  getAirQuality(lat: number, lon: number): Promise<AirQualitySnapshot>;
}

export interface IPlanOrchestrator {
  generatePlan(profile: Profile): Promise<CompletePlan>;
}
