/**
 * @fileoverview Geocoding service using Open-Meteo Geocoding API.
 * Free, keyless location search with strict Zod validation.
 */

import { type FetchFn, resilientFetchJson } from "@/lib/http";
import { sanitizeInput } from "@/lib/sanitize";
import { type GeocodeResultItem, GeocodeResponseSchema } from "@/schemas/airQuality";
import type { IGeocodingService } from "./types";

const OPEN_METEO_GEOCODE_ENDPOINT = "https://geocoding-api.open-meteo.com/v1/search";

function buildGeocodeUrl(query: string): string {
  const url = new URL(OPEN_METEO_GEOCODE_ENDPOINT);
  url.searchParams.set("name", query);
  url.searchParams.set("count", "6");
  url.searchParams.set("language", "en");
  url.searchParams.set("format", "json");
  return url.toString();
}

export class GeocodingService implements IGeocodingService {
  constructor(private readonly fetchFn: FetchFn = fetch) {}

  /**
   * Searches geographical coordinates and metadata for a city or neighborhood query.
   *
   * @param query - Location search term.
   * @returns List of geocoded result items.
   */
  public async search(query: string): Promise<readonly GeocodeResultItem[]> {
    const cleaned = sanitizeInput(query, 100);
    if (cleaned.length < 2) return [];

    const url = buildGeocodeUrl(cleaned);
    const rawData = await resilientFetchJson<unknown>(url, { timeoutMs: 5000 }, this.fetchFn);
    const parsed = GeocodeResponseSchema.safeParse(rawData);

    if (!parsed.success) {
      return [];
    }

    return parsed.data.results;
  }
}

export const geocodingService = new GeocodingService();
