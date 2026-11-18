/**
 * @fileoverview Air quality data retrieval service using Open-Meteo Air Quality API.
 * Features 10-minute in-memory caching, parallelized queries, and fallback zero-filling for null values.
 */

import { airQualityCache } from "@/lib/cache";
import { type FetchFn, resilientFetchJson } from "@/lib/http";
import { OpenMeteoAirQualityResponseSchema } from "@/schemas/airQuality";
import type { AirQualitySnapshot, IAirQualityService } from "./types";

/**
 * Builds the Open-Meteo air quality endpoint URL.
 */
function buildApiUrl(lat: number, lon: number): string {
  const roundedLat = lat.toFixed(2);
  const roundedLon = lon.toFixed(2);
  const params = [
    `latitude=${roundedLat}`,
    `longitude=${roundedLon}`,
    "current=pm2_5,pm10,nitrogen_dioxide,ozone,us_aqi",
    "hourly=pm2_5,pm10,nitrogen_dioxide,ozone,us_aqi",
    "timezone=auto",
    "forecast_days=2",
  ].join("&");

  return `https://air-quality-api.open-meteo.com/v1/air-quality?${params}`;
}

/**
 * Normalizes an array of potentially null particulate numbers into clean numbers.
 */
function cleanSeries(series: readonly (number | null)[]): number[] {
  let lastKnown = 25;
  return series.map((val) => {
    if (val !== null && !isNaN(val)) {
      lastKnown = val;
      return val;
    }
    return lastKnown;
  });
}

function extractMetric(
  val: number | null | undefined,
  fallbackVal: number | undefined,
  def: number,
): number {
  if (typeof val === "number") return val;
  if (typeof fallbackVal === "number") return fallbackVal;
  return def;
}

function extractGas(val: number | null | undefined): number | undefined {
  return typeof val === "number" ? val : undefined;
}

function buildSnapshot(
  parsed: import("@/schemas/airQuality").OpenMeteoAirQualityResponse,
  hourlyPm25: readonly number[],
  hourlyPm10: readonly number[],
  hourlyUsAqi: readonly number[],
): AirQualitySnapshot {
  const current = parsed.current;
  return {
    latitude: parsed.latitude,
    longitude: parsed.longitude,
    timezone: parsed.timezone,
    currentPm25: extractMetric(current?.pm2_5, hourlyPm25[0], 50),
    currentPm10: extractMetric(current?.pm10, hourlyPm10[0], 100),
    currentNo2: extractGas(current?.nitrogen_dioxide),
    currentO3: extractGas(current?.ozone),
    currentUsAqi: extractMetric(current?.us_aqi, hourlyUsAqi[0], 150),
    hourlyTimes: parsed.hourly.time.slice(0, 24),
    hourlyPm25: hourlyPm25.slice(0, 24),
    hourlyPm10: hourlyPm10.slice(0, 24),
    hourlyUsAqi: hourlyUsAqi.slice(0, 24),
  };
}

export class AirQualityService implements IAirQualityService {
  constructor(private readonly fetchFn: FetchFn = fetch) {}

  /**
   * Fetches ambient current and hourly particulate forecasts for specified coordinates.
   *
   * @param lat - Latitude coordinate.
   * @param lon - Longitude coordinate.
   * @returns Structured AirQualitySnapshot.
   */
  public async getAirQuality(lat: number, lon: number): Promise<AirQualitySnapshot> {
    const cacheKey = `${lat.toFixed(2)}_${lon.toFixed(2)}`;
    const cached = airQualityCache.get(cacheKey) as AirQualitySnapshot | null;
    if (cached) return cached;

    const url = buildApiUrl(lat, lon);
    const rawData = await resilientFetchJson<unknown>(
      url,
      { timeoutMs: 8000, retries: 1 },
      this.fetchFn,
    );
    const parsed = OpenMeteoAirQualityResponseSchema.parse(rawData);

    const snapshot = buildSnapshot(
      parsed,
      cleanSeries(parsed.hourly.pm2_5),
      cleanSeries(parsed.hourly.pm10),
      cleanSeries(parsed.hourly.us_aqi),
    );

    airQualityCache.set(cacheKey, snapshot);
    return snapshot;
  }
}

export const airQualityService = new AirQualityService();
