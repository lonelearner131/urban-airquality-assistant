import React from "react";
import { Activity, Cigarette, Flame, TrendingDown } from "lucide-react";
import type { ExposureEstimate } from "@/domain/types";

export interface ImpactPanelProps {
  readonly exposure: ExposureEstimate;
  readonly impactNarrative: string;
  readonly language?: "en" | "hi";
}

function ExposureMetricCard({
  exposure,
  isHindi,
}: {
  readonly exposure: ExposureEstimate;
  readonly isHindi: boolean;
}): React.JSX.Element {
  return (
    <div className="flex flex-col justify-between rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 dark:border-emerald-900/60 dark:bg-emerald-950/30">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase text-emerald-800 dark:text-emerald-300">
          {isHindi ? "एक्सपोजर में कमी" : "Inhaled PM2.5 Dose"}
        </span>
        <TrendingDown className="h-4 w-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
      </div>
      <div className="mt-2">
        <span className="text-4xl font-extrabold text-emerald-700 dark:text-emerald-400">
          -{exposure.reductionPct}%
        </span>
        <p className="mt-1 text-xs text-emerald-800 dark:text-emerald-300">
          From {exposure.baselineUgM3h} down to {exposure.withPlanUgM3h} µg/m³·h
        </p>
      </div>
    </div>
  );
}

function CigaretteMetricCard({
  exposure,
  isHindi,
}: {
  readonly exposure: ExposureEstimate;
  readonly isHindi: boolean;
}): React.JSX.Element {
  return (
    <div className="flex flex-col justify-between rounded-xl border border-amber-200 bg-amber-50/50 p-4 dark:border-amber-900/60 dark:bg-amber-950/30">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase text-amber-800 dark:text-amber-300">
          {isHindi ? "सिगरेट तुल्यता (अनुमानित)" : "Cigarette Equiv. (Approx)"}
        </span>
        <Cigarette className="h-4 w-4 text-amber-600 dark:text-amber-400" aria-hidden="true" />
      </div>
      <div className="mt-2">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-amber-700 dark:text-amber-400">
            {exposure.withPlanCigarettesDay}
          </span>
          <span className="text-xs text-amber-800 line-through dark:text-amber-300">
            was {exposure.baselineCigarettesDay}
          </span>
          <span className="text-xs text-amber-800 dark:text-amber-300">cigs/day</span>
        </div>
        <p className="mt-1 text-xs text-amber-800 dark:text-amber-300">
          Approx. heuristic: 22 µg/m³ PM2.5 ≈ 1 cigarette
        </p>
      </div>
    </div>
  );
}

function Co2MetricCard({
  co2SavedKg,
  isHindi,
}: {
  readonly co2SavedKg: number;
  readonly isHindi: boolean;
}): React.JSX.Element {
  return (
    <div className="flex flex-col justify-between rounded-xl border border-sky-200 bg-sky-50/50 p-4 dark:border-sky-900/60 dark:bg-sky-950/30">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase text-sky-800 dark:text-sky-300">
          {isHindi ? "CO2 उत्सर्जन बचत" : "Daily CO2 Avoided"}
        </span>
        <Flame className="h-4 w-4 text-sky-600 dark:text-sky-400" aria-hidden="true" />
      </div>
      <div className="mt-2">
        <span className="text-4xl font-extrabold text-sky-700 dark:text-sky-400">{co2SavedKg}</span>
        <span className="ml-1 text-sm font-semibold text-sky-800 dark:text-sky-300">
          kg CO2/day
        </span>
        <p className="mt-1 text-xs text-sky-800 dark:text-sky-300">
          From transit & induction choices
        </p>
      </div>
    </div>
  );
}

export function ImpactPanel({
  exposure,
  impactNarrative,
  language = "en",
}: ImpactPanelProps): React.JSX.Element {
  const isHindi = language === "hi";

  return (
    <section
      aria-label="Quantified Impact of Choices"
      className="flex flex-col gap-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="flex items-center gap-3 border-b border-slate-100 pb-3 dark:border-slate-800">
        <div className="rounded-xl bg-indigo-100 p-2 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
          <Activity className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            {isHindi
              ? "प्रत्यक्ष, प्रमाणित प्रभाव (Quantified Impact)"
              : "Direct Quantified Health & Environmental Impact"}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Mathematical dose modeling based on WHO guidelines and Berkeley Earth heuristics
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <ExposureMetricCard exposure={exposure} isHindi={isHindi} />
        <CigaretteMetricCard exposure={exposure} isHindi={isHindi} />
        <Co2MetricCard co2SavedKg={exposure.co2SavedKg} isHindi={isHindi} />
      </div>
      <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm leading-relaxed text-slate-700 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-300">
        <strong>{isHindi ? "प्रभाव व्याख्या:" : "Summary:"}</strong> {impactNarrative}
      </div>
    </section>
  );
}
