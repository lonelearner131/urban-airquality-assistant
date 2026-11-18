import React from "react";
import { CheckCircle2, Home } from "lucide-react";
import type { RecommendationRule } from "@/domain/types";

export interface IndoorHacksProps {
  readonly hacks: readonly string[];
  readonly rules: readonly RecommendationRule[];
  readonly language?: "en" | "hi";
}

function IndoorRuleCard({
  rule,
  language,
}: {
  readonly rule: RecommendationRule;
  readonly language: "en" | "hi";
}): React.JSX.Element {
  return (
    <div className="flex flex-col gap-1 rounded-xl border border-emerald-100 bg-emerald-50/40 p-3.5 text-sm dark:border-emerald-950/60 dark:bg-emerald-950/20">
      <span className="font-semibold text-emerald-900 dark:text-emerald-300">
        {language === "hi" ? rule.titleHindi : rule.title}
      </span>
      <p className="text-xs text-emerald-800 dark:text-emerald-400">
        {language === "hi" ? rule.descriptionHindi : rule.description}
      </p>
    </div>
  );
}

function IndoorHacksHeader({ isHindi }: { readonly isHindi: boolean }): React.JSX.Element {
  return (
    <div className="flex items-center gap-3 border-b border-slate-100 pb-3 dark:border-slate-800">
      <div className="rounded-xl bg-sky-100 p-2 text-sky-700 dark:bg-sky-950 dark:text-sky-300">
        <Home className="h-5 w-5" aria-hidden="true" />
      </div>
      <div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
          {isHindi ? "इंडोर वायु गुणवत्ता हैक्स" : "Indoor Air Quality Hacks"}
        </h3>
        <p className="text-xs text-slate-500">
          Low-cost interventions to seal and sanitize residential air
        </p>
      </div>
    </div>
  );
}

export function IndoorHacks({
  hacks,
  rules,
  language = "en",
}: IndoorHacksProps): React.JSX.Element {
  const indoorRules = rules.filter((r) => r.category === "indoor");
  const isHindi = language === "hi";

  return (
    <section
      aria-label="Indoor Air Quality Hacks"
      className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
    >
      <IndoorHacksHeader isHindi={isHindi} />
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {hacks.map((hack, i) => (
          <div
            key={i}
            className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-3.5 text-sm dark:border-slate-800 dark:bg-slate-800/30"
          >
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
            <p className="leading-relaxed text-slate-800 dark:text-slate-200">{hack}</p>
          </div>
        ))}
        {indoorRules.map((rule) => (
          <IndoorRuleCard key={rule.id} rule={rule} language={language} />
        ))}
      </div>
    </section>
  );
}
