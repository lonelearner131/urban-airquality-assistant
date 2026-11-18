import React from "react";
import { Leaf } from "lucide-react";
import type { RecommendationRule } from "@/domain/types";

export interface AlternativesProps {
  readonly alternatives: readonly string[];
  readonly rules: readonly RecommendationRule[];
  readonly language?: "en" | "hi";
}

function AlternativeCard({
  rule,
  language,
}: {
  readonly rule: RecommendationRule;
  readonly language: "en" | "hi";
}): React.JSX.Element {
  return (
    <div className="flex flex-col gap-1.5 rounded-xl border border-slate-200 bg-slate-50/50 p-4 text-sm dark:border-slate-800 dark:bg-slate-800/30">
      <div className="flex items-center justify-between">
        <span className="font-semibold text-slate-900 dark:text-slate-100">
          {language === "hi" ? rule.titleHindi : rule.title}
        </span>
        {rule.emissionSavedKgCo2 && (
          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
            -{rule.emissionSavedKgCo2} kg CO2/day
          </span>
        )}
      </div>
      <p className="text-xs text-slate-600 dark:text-slate-400">
        {language === "hi" ? rule.descriptionHindi : rule.description}
      </p>
    </div>
  );
}

export function Alternatives({
  alternatives: _alternatives,
  rules,
  language = "en",
}: AlternativesProps): React.JSX.Element {
  const sustainableRules = rules.filter((r) => r.category === "sustainable");

  return (
    <section
      aria-label="Sustainable Alternatives"
      className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="flex items-center gap-3 border-b border-slate-100 pb-3 dark:border-slate-800">
        <div className="rounded-xl bg-emerald-100 p-2 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
          <Leaf className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            {language === "hi"
              ? "टिकाऊ विकल्प (Sustainable Alternatives)"
              : "Sustainable Daily Alternatives"}
          </h3>
          <p className="text-xs text-slate-500">
            Commute, cooking, heating, and waste choices that reduce ambient emissions
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {sustainableRules.map((rule) => (
          <AlternativeCard key={rule.id} rule={rule} language={language} />
        ))}
      </div>
    </section>
  );
}
