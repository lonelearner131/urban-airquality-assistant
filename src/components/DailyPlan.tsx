import React from "react";
import { Sun, Sunrise, Sunset } from "lucide-react";
import type { AiNarrative, AiPlanStep } from "@/schemas/plan";

export interface DailyPlanProps {
  readonly narrative: AiNarrative;
  readonly language?: "en" | "hi";
}

function renderTimeSlotIcon(slot: "morning" | "afternoon" | "evening"): React.JSX.Element {
  if (slot === "morning") return <Sunrise className="h-5 w-5 text-amber-500" aria-hidden="true" />;
  if (slot === "afternoon") return <Sun className="h-5 w-5 text-sky-500" aria-hidden="true" />;
  return <Sunset className="h-5 w-5 text-indigo-500" aria-hidden="true" />;
}

function TimelineStepCard({ step }: { readonly step: AiPlanStep }): React.JSX.Element {
  return (
    <div className="flex items-start gap-4 rounded-xl border border-slate-100 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-800/40">
      <div className="shrink-0 rounded-xl border border-slate-200 bg-white p-2.5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        {renderTimeSlotIcon(step.timeSlot)}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {step.timeSlot}
          </span>
          <span className="text-xs text-slate-400">·</span>
          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">{step.title}</h4>
        </div>
        <p className="mt-1 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          {step.instruction}
        </p>
      </div>
    </div>
  );
}

export function DailyPlan({ narrative }: DailyPlanProps): React.JSX.Element {
  return (
    <section
      aria-label="Daily Low-Emission Plan"
      className="flex flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
    >
      <div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
          {narrative.headline}
        </h3>
        <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          {narrative.plainSummary}
        </p>
      </div>
      <div className="flex flex-col gap-4">
        {narrative.timelineSteps.map((step, idx) => (
          <TimelineStepCard key={idx} step={step} />
        ))}
      </div>
    </section>
  );
}
