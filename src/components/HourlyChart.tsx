"use client";

import React, { useState } from "react";
import type { HourlyPoint, WindowRecommendation } from "@/domain/types";

export interface HourlyChartProps {
  readonly points: readonly HourlyPoint[];
  readonly windows: WindowRecommendation;
  readonly language?: "en" | "hi";
}

/**
 * Builds SVG path coordinate string for PM2.5 data points.
 */
function buildSvgPolyline(
  points: readonly HourlyPoint[],
  width: number,
  height: number,
  maxPm: number,
): string {
  if (points.length === 0) return "";
  const stepX = width / Math.max(1, points.length - 1);
  return points
    .map((pt, i) => {
      const x = i * stepX;
      const y = height - (pt.pm25 / Math.max(10, maxPm)) * (height - 30) - 15;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

interface ChartHeaderProps {
  readonly language: "en" | "hi";
  readonly windows: WindowRecommendation;
  readonly showTable: boolean;
  readonly onToggleTable: () => void;
}

function ChartHeader({
  language,
  windows,
  showTable,
  onToggleTable,
}: ChartHeaderProps): React.JSX.Element {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
          {language === "hi" ? "24-घंटे का PM2.5 पूर्वानुमान" : "24-Hour PM2.5 Pollution Trajectory"}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Cleanest window:{" "}
          <strong className="text-emerald-700 dark:text-emerald-400">
            {windows.cleanestHour}:00 ({windows.cleanestPm25} µg/m³)
          </strong>{" "}
          · Peak:{" "}
          <strong className="text-rose-700 dark:text-rose-400">
            {windows.worstHour}:00 ({windows.worstPm25} µg/m³)
          </strong>
        </p>
      </div>
      <button
        type="button"
        onClick={onToggleTable}
        className="flex min-h-[44px] items-center px-2 text-xs font-semibold text-sky-600 hover:underline dark:text-sky-400"
      >
        {showTable ? "Hide data table" : "View accessible table"}
      </button>
    </div>
  );
}

interface SvgViewProps {
  readonly points: readonly HourlyPoint[];
  readonly polylineCoords: string;
  readonly chartSummary: string;
  readonly chartWidth: number;
  readonly chartHeight: number;
  readonly maxPm: number;
}

function ChartGridlines({
  width,
  height,
}: {
  readonly width: number;
  readonly height: number;
}): React.JSX.Element {
  return (
    <>
      <line
        x1="0"
        y1={height - 15}
        x2={width}
        y2={height - 15}
        stroke="currentColor"
        strokeOpacity="0.1"
        strokeWidth="1"
      />
      <line
        x1="0"
        y1="20"
        x2={width}
        y2="20"
        stroke="currentColor"
        strokeOpacity="0.1"
        strokeWidth="1"
      />
    </>
  );
}

function ChartKeyMarkers({
  points,
  width,
  height,
  maxPm,
}: {
  readonly points: readonly HourlyPoint[];
  readonly width: number;
  readonly height: number;
  readonly maxPm: number;
}): React.JSX.Element {
  return (
    <>
      {points.map((pt, i) => {
        if (!pt.isCleanest && !pt.isWorst) return null;
        const x = i * (width / Math.max(1, points.length - 1));
        const y = height - (pt.pm25 / Math.max(10, maxPm)) * (height - 30) - 15;
        const fill = pt.isCleanest ? "#10b981" : "#ef4444";
        return (
          <g key={pt.isoTime}>
            <circle cx={x} cy={y} r="6" fill={fill} stroke="#ffffff" strokeWidth="2" />
            <text
              x={x}
              y={y - 10}
              textAnchor="middle"
              fontSize="10"
              fontWeight="bold"
              fill="currentColor"
            >
              {pt.pm25}
            </text>
          </g>
        );
      })}
    </>
  );
}

function SvgChart({
  points,
  polylineCoords,
  chartSummary,
  chartWidth,
  chartHeight,
  maxPm,
}: SvgViewProps): React.JSX.Element {
  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        className="h-44 w-full overflow-visible text-sky-500"
        role="img"
        aria-label={chartSummary}
      >
        <title>{chartSummary}</title>
        <ChartGridlines width={chartWidth} height={chartHeight} />
        <polyline
          fill="none"
          stroke="currentColor"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={polylineCoords}
        />
        <ChartKeyMarkers points={points} width={chartWidth} height={chartHeight} maxPm={maxPm} />
      </svg>
    </div>
  );
}

function TableHead(): React.JSX.Element {
  return (
    <thead className="bg-slate-50 dark:bg-slate-800">
      <tr>
        <th scope="col" className="p-2.5">
          Time
        </th>
        <th scope="col" className="p-2.5">
          PM2.5 (µg/m³)
        </th>
        <th scope="col" className="p-2.5">
          AQI
        </th>
        <th scope="col" className="p-2.5">
          Status
        </th>
      </tr>
    </thead>
  );
}

function AccessibleDataTable({
  points,
}: {
  readonly points: readonly HourlyPoint[];
}): React.JSX.Element {
  return (
    <div className="mt-2 overflow-x-auto">
      <table className="w-full rounded-lg border border-slate-200 text-left text-xs dark:border-slate-800">
        <caption className="sr-only">Hourly particulate matter data points</caption>
        <TableHead />
        <tbody>
          {points.map((p) => (
            <tr key={p.isoTime} className="border-t border-slate-100 dark:border-slate-800">
              <td className="p-2.5">{String(p.hour).padStart(2, "0")}:00</td>
              <td className="p-2.5 font-medium">{p.pm25}</td>
              <td className="p-2.5">{p.aqi}</td>
              <td className="p-2.5 font-semibold text-emerald-600 dark:text-emerald-400">
                {p.isCleanest ? "Cleanest Window" : p.isWorst ? "Peak Smog" : "Normal"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function HourlyChart({
  points,
  windows,
  language = "en",
}: HourlyChartProps): React.JSX.Element {
  const [showTable, setShowTable] = useState(false);
  const maxPm = Math.max(...points.map((p) => p.pm25), 100);
  const chartWidth = 600;
  const chartHeight = 180;
  const polylineCoords = buildSvgPolyline(points, chartWidth, chartHeight, maxPm);

  const chartSummary = `Hourly PM2.5 forecast: Peak pollution reaches ${windows.worstPm25} µg/m³ at hour ${windows.worstHour}:00. Cleanest air is ${windows.cleanestPm25} µg/m³ at hour ${windows.cleanestHour}:00.`;

  return (
    <section
      aria-label="Hourly Air Quality Forecast"
      className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
    >
      <ChartHeader
        language={language}
        windows={windows}
        showTable={showTable}
        onToggleTable={() => setShowTable(!showTable)}
      />
      <SvgChart
        points={points}
        polylineCoords={polylineCoords}
        chartSummary={chartSummary}
        chartWidth={chartWidth}
        chartHeight={chartHeight}
        maxPm={maxPm}
      />
      {showTable && <AccessibleDataTable points={points} />}
    </section>
  );
}
