/**
 * @fileoverview Air quality data retrieval service using Open-Meteo Air Quality API.
 * Features 10-minute in-memory caching, parallelized queries, and fallback zero-filling for null values.
 */

import { NETWORK_CONFIG } from "@/domain/constants";
import { airQualityCache } from "@/lib/cache";
import { ValidationError } from "@/lib/errors";
import { type FetchFn, resilientFetchJson } from "@/lib/http";
import {
  type OpenMeteoAirQualityResponse,
  OpenMeteoAirQualityResponseSchema,
} from "@/schemas/airQuality";
import type { AirQualitySnapshot, IAirQualityService } from "./types";

const OPEN_METEO_AQ_ENDPOINT = "https://air-quality-api.open-meteo.com/v1/air-quality";

/**
 * Builds the Open-Meteo air quality endpoint URL using URLSearchParams.
 */
function buildApiUrl(lat: number, lon: number): string {
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    throw new ValidationError("Invalid coordinates provided");
  }
  const url = new URL(OPEN_METEO_AQ_ENDPOINT);
  url.searchParams.set("latitude", lat.toFixed(NETWORK_CONFIG.COORDINATE_DECIMAL_PLACES));
  url.searchParams.set("longitude", lon.toFixed(NETWORK_CONFIG.COORDINATE_DECIMAL_PLACES));
  url.searchParams.set("current", "pm2_5,pm10,nitrogen_dioxide,ozone,us_aqi");
  url.searchParams.set("hourly", "pm2_5,pm10,nitrogen_dioxide,ozone,us_aqi");
  url.searchParams.set("timezone", "auto");
  url.searchParams.set("forecast_days", "2");
  return url.toString();
}

/**
 * Normalizes an array of potentially null particulate numbers into clean numbers.
 */
function cleanSeries(series: readonly (number | null)[]): number[] {
  let lastKnown = 25;
  return series.map((val) => {
    if (val !== null && Number.isFinite(val)) {
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
  if (typeof val === "number" && Number.isFinite(val)) return val;
  if (typeof fallbackVal === "number" && Number.isFinite(fallbackVal)) return fallbackVal;
  return def;
}

function extractGas(val: number | null | undefined): number | undefined {
  return typeof val === "number" && Number.isFinite(val) ? val : undefined;
}

function buildSnapshot(
  parsed: OpenMeteoAirQualityResponse,
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
      { timeoutMs: NETWORK_CONFIG.HTTP_TIMEOUT_MS, retries: NETWORK_CONFIG.MAX_RETRIES },
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
