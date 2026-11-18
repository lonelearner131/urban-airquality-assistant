/**
 * @fileoverview Geocoding service using Open-Meteo Geocoding API.
 * Free, keyless location search with strict Zod validation.
 */

import { type FetchFn, resilientFetchJson } from "@/lib/http";
import { type GeocodeResultItem, GeocodeResponseSchema } from "@/schemas/airQuality";
import type { IGeocodingService } from "./types";

export class GeocodingService implements IGeocodingService {
  constructor(private readonly fetchFn: FetchFn = fetch) {}

  /**
   * Searches geographical coordinates and metadata for a city or neighborhood query.
   *
   * @param query - Location search term.
   * @returns List of geocoded result items.
   */
  public async search(query: string): Promise<readonly GeocodeResultItem[]> {
    const trimmed = query.trim();
    if (trimmed.length < 2) return [];

    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
      trimmed,
    )}&count=6&language=en&format=json`;

    const rawData = await resilientFetchJson<unknown>(url, { timeoutMs: 5000 }, this.fetchFn);
    const parsed = GeocodeResponseSchema.safeParse(rawData);

    if (!parsed.success) {
      return [];
    }

    return parsed.data.results;
  }
}

export const geocodingService = new GeocodingService();
