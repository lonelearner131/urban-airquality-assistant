/**
 * @fileoverview Hourly window optimization algorithms.
 * Identifies the diurnal troughs and peaks in particulate pollution to recommend
 * safe windows for essential outdoor commutes, ventilation, or school runs.
 */

import type { HourlyPoint, SafeWindow, WindowRecommendation } from "@/domain/types";

interface RawHourlyInput {
  readonly time: string;
  readonly pm25: number;
  readonly aqi: number;
}

/**
 * Extracts the 24-hour hour index (0-23) from an ISO time string or timestamp.
 */
export function extractHourFromIso(isoString: string): number {
  const date = new Date(isoString);
  return isNaN(date.getTime()) ? 0 : date.getHours();
}

/**
 * Identifies the minimum and maximum PM2.5 indices across hourly forecasts.
 */
function findExtremaIndices(points: readonly RawHourlyInput[]): { minIdx: number; maxIdx: number } {
  let minIdx = 0;
  let maxIdx = 0;
  for (let i = 1; i < points.length; i++) {
    const point = points[i];
    const minPoint = points[minIdx];
    const maxPoint = points[maxIdx];
    if (point && minPoint && point.pm25 < minPoint.pm25) minIdx = i;
    if (point && maxPoint && point.pm25 > maxPoint.pm25) maxIdx = i;
  }
  return { minIdx, maxIdx };
}

/**
 * Discovers the best 2-hour contiguous daytime window (between 06:00 and 21:00).
 */
function findBestDaytimeWindow(points: readonly RawHourlyInput[]): SafeWindow | null {
  if (points.length < 2) return null;
  let bestWindow: SafeWindow | null = null;
  let lowestMean = Number.POSITIVE_INFINITY;

  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i];
    const p2 = points[i + 1];
    if (!p1 || !p2) continue;
    const h1 = extractHourFromIso(p1.time);
    const h2 = extractHourFromIso(p2.time);
    const mean = (p1.pm25 + p2.pm25) / 2;
    if (mean < lowestMean) {
      lowestMean = mean;
      bestWindow = {
        startHour: h1,
        endHour: (h2 + 1) % 24,
        label: `${String(h1).padStart(2, "0")}:00 - ${String((h2 + 1) % 24).padStart(2, "0")}:00`,
        averagePm25: Math.round(mean),
      };
    }
  }
  return bestWindow;
}

/**
 * Maps raw hourly points to labeled HourlyPoints with cleanest/worst markers.
 */
export function buildHourlyPoints(
  rawPoints: readonly RawHourlyInput[],
  minIdx: number,
  maxIdx: number,
): HourlyPoint[] {
  return rawPoints.map((pt, idx) => ({
    isoTime: pt.time,
    hour: extractHourFromIso(pt.time),
    pm25: pt.pm25,
    aqi: pt.aqi,
    isCleanest: idx === minIdx,
    isWorst: idx === maxIdx,
  }));
}

/**
 * Analyzes hourly air quality forecast to produce actionable outdoor timing recommendations.
 *
 * @param rawPoints - Hourly forecast series.
 * @returns Complete window recommendation with best/worst markers and safe windows.
 */
export function optimizeHourlyWindows(rawPoints: readonly RawHourlyInput[]): {
  recommendation: WindowRecommendation;
  enrichedPoints: HourlyPoint[];
} {
  if (rawPoints.length === 0) {
    throw new Error("Cannot optimize windows for empty hourly points");
  }
  const { minIdx, maxIdx } = findExtremaIndices(rawPoints);
  const enrichedPoints = buildHourlyPoints(rawPoints, minIdx, maxIdx);
  const defaultPoint: RawHourlyInput = { time: "", pm25: 0, aqi: 0 };
  const minPoint = rawPoints[minIdx] ?? rawPoints[0] ?? defaultPoint;
  const maxPoint = rawPoints[maxIdx] ?? rawPoints[0] ?? defaultPoint;
  const bestDayWindow = findBestDaytimeWindow(rawPoints);
  const safeWindows = bestDayWindow ? [bestDayWindow] : [];

  return {
    enrichedPoints,
    recommendation: {
      cleanestHour: extractHourFromIso(minPoint.time),
      cleanestIsoTime: minPoint.time,
      cleanestPm25: minPoint.pm25,
      worstHour: extractHourFromIso(maxPoint.time),
      worstIsoTime: maxPoint.time,
      worstPm25: maxPoint.pm25,
      safeWindows,
    },
  };
}
