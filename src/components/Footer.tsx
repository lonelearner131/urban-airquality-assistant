import React from "react";

export function Footer(): React.JSX.Element {
  return (
    <footer className="border-t border-slate-200 bg-slate-50 py-8 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-semibold text-slate-700 dark:text-slate-300">
            SmogShield · Urban Air Quality Assistant
          </p>
          <p className="mt-1">
            Data sourced from Open-Meteo Air Quality & Geocoding APIs. Standards derived from WHO
            (2021), CPCB India, and US EPA.
          </p>
        </div>
        <div className="flex flex-wrap gap-4 text-xs">
          <span>Zero PII Stored</span>
          <span>·</span>
          <span>Privacy-Preserving (2-decimal coordinates)</span>
          <span>·</span>
          <span>WCAG 2.2 AA Compliant</span>
        </div>
      </div>
    </footer>
  );
}
