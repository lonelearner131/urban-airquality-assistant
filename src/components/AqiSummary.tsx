import React from "react";
import { AlertTriangle, CheckCircle, ShieldAlert, WifiOff } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import type { AqiCategory, ComputedAqi, RiskAssessment } from "@/domain/types";

export interface AqiSummaryProps {
  readonly computedAqi: ComputedAqi;
  readonly riskAssessment: RiskAssessment;
  readonly locationName: string;
  readonly isAiGenerated: boolean;
  readonly language?: "en" | "hi";
}

function CategoryIcon({ band }: { readonly band: string }): React.JSX.Element {
  if (band === "GOOD" || band === "SATISFACTORY") {
    return (
      <CheckCircle className="h-8 w-8 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
    );
  }
  if (band === "MODERATE") {
    return (
      <AlertTriangle className="h-8 w-8 text-amber-600 dark:text-amber-400" aria-hidden="true" />
    );
  }
  return <ShieldAlert className="h-8 w-8 text-rose-600 dark:text-rose-400" aria-hidden="true" />;
}

function AqiHeroCard({
  aqi,
  scale,
  category,
  dominantPollutant,
  isHindi,
}: {
  readonly aqi: number;
  readonly scale: string;
  readonly category: AqiCategory;
  readonly dominantPollutant: string;
  readonly isHindi: boolean;
}): React.JSX.Element {
  return (
    <div className="flex items-center gap-5 rounded-xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/30">
      <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <CategoryIcon band={category.band} />
      </div>
      <div>
        <div className="flex items-baseline gap-2">
          <span className="text-5xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
            {aqi}
          </span>
          <span className="text-xs font-semibold uppercase text-slate-500">
            {scale === "INDIA_NAQI" ? "India NAQI" : "US EPA AQI"}
          </span>
        </div>
        <div className="mt-1 flex items-center gap-2">
          <span className="text-base font-semibold text-slate-900 dark:text-slate-100">
            {isHindi ? category.hindiLabel : category.label}
          </span>
          <span className="text-xs text-slate-500">
            · Dominant: {dominantPollutant.toUpperCase()}
          </span>
        </div>
      </div>
    </div>
  );
}

function RiskCard({
  riskAssessment,
  isHindi,
}: {
  readonly riskAssessment: RiskAssessment;
  readonly isHindi: boolean;
}): React.JSX.Element {
  const variant =
    riskAssessment.tier === "LOW"
      ? "success"
      : riskAssessment.tier === "MODERATE"
        ? "warning"
        : "danger";

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/30">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {isHindi ? "व्यक्तिगत जोखिम स्तर" : "Personal Risk Tier"}
        </span>
        <Badge variant={variant}>
          {riskAssessment.tier} RISK ({riskAssessment.multiplier}x)
        </Badge>
      </div>
      <p className="mt-1 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
        {isHindi ? riskAssessment.rationaleHindi : riskAssessment.rationale}
      </p>
    </div>
  );
}

function AqiHeader({
  locationName,
  isAiGenerated,
  isHindi,
}: {
  readonly locationName: string;
  readonly isAiGenerated: boolean;
  readonly isHindi: boolean;
}): React.JSX.Element {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
      <div>
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {isHindi ? "वर्तमान वायु गुणवत्ता" : "Current Air Quality"}
        </span>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{locationName}</h2>
      </div>
      {!isAiGenerated && (
        <Badge variant="warning" className="text-xs">
          <WifiOff className="mr-1 h-3.5 w-3.5" aria-hidden="true" />
          <span>{isHindi ? "ऑफ़लाइन स्मार्ट-रूल्स मोड" : "Offline smart-rules mode"}</span>
        </Badge>
      )}
    </div>
  );
}

function ParticulatePills({
  pm25,
  pm10,
}: {
  readonly pm25: number;
  readonly pm10?: number | undefined;
}): React.JSX.Element {
  return (
    <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-1 text-xs text-slate-600 dark:border-slate-800 dark:text-slate-300">
      <span className="rounded-lg bg-slate-100 px-3 py-1.5 dark:bg-slate-800">
        PM2.5: <strong className="text-slate-900 dark:text-slate-100">{pm25} µg/m³</strong>
      </span>
      {pm10 !== undefined && (
        <span className="rounded-lg bg-slate-100 px-3 py-1.5 dark:bg-slate-800">
          PM10: <strong className="text-slate-900 dark:text-slate-100">{pm10} µg/m³</strong>
        </span>
      )}
    </div>
  );
}

export function AqiSummary({
  computedAqi,
  riskAssessment,
  locationName,
  isAiGenerated,
  language = "en",
}: AqiSummaryProps): React.JSX.Element {
  const isHindi = language === "hi";

  return (
    <article
      aria-label="Air quality summary"
      className="flex flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
    >
      <AqiHeader locationName={locationName} isAiGenerated={isAiGenerated} isHindi={isHindi} />
      <div className="grid grid-cols-1 items-center gap-6 md:grid-cols-2">
        <AqiHeroCard
          aqi={computedAqi.value}
          scale={computedAqi.scale}
          category={computedAqi.category}
          dominantPollutant={computedAqi.dominantPollutant}
          isHindi={isHindi}
        />
        <RiskCard riskAssessment={riskAssessment} isHindi={isHindi} />
      </div>
      <ParticulatePills pm25={computedAqi.pm25} pm10={computedAqi.pm10} />
    </article>
  );
}
