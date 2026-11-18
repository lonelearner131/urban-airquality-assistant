/**
 * @fileoverview Factory function to select the appropriate AQI scale.
 * Defaults to India NAQI for locations in India, and US EPA AQI globally.
 */

import { IndiaNaqiScale } from "./indiaNaqiScale";
import type { AqiScale } from "./scale";
import { UsEpaScale } from "./usEpaScale";

const INDIA_COUNTRY_CODE = "IN";

/**
 * Approximate geographical bounding box for the Republic of India.
 */
const INDIA_BOUNDS = {
  MIN_LAT: 6.0,
  MAX_LAT: 37.5,
  MIN_LON: 68.0,
  MAX_LON: 97.5,
} as const;

/**
 * Checks whether coordinates lie approximately within India's territorial bounds.
 */
function isWithinIndiaBounds(lat: number, lon: number): boolean {
  return (
    lat >= INDIA_BOUNDS.MIN_LAT &&
    lat <= INDIA_BOUNDS.MAX_LAT &&
    lon >= INDIA_BOUNDS.MIN_LON &&
    lon <= INDIA_BOUNDS.MAX_LON
  );
}

/**
 * Selects the appropriate AQI scale implementation.
 *
 * @param countryCode - ISO-3166-1 alpha-2 country code (e.g., 'IN', 'US').
 * @param lat - Latitude coordinate.
 * @param lon - Longitude coordinate.
 * @returns An instance of AqiScale (IndiaNaqiScale or UsEpaScale).
 */
export function selectAqiScale(countryCode?: string, lat?: number, lon?: number): AqiScale {
  if (countryCode && countryCode.toUpperCase() === INDIA_COUNTRY_CODE) {
    return new IndiaNaqiScale();
  }
  if (lat !== undefined && lon !== undefined && isWithinIndiaBounds(lat, lon)) {
    return new IndiaNaqiScale();
  }
  return new UsEpaScale();
}
