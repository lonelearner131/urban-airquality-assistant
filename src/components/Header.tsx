import React from "react";
import { ShieldAlert } from "lucide-react";

export interface HeaderProps {
  readonly language: "en" | "hi";
  readonly onLanguageChange: (lang: "en" | "hi") => void;
}

function LanguageButton({
  active,
  label,
  ariaLabel,
  langAttr,
  onClick,
}: {
  readonly active: boolean;
  readonly label: string;
  readonly ariaLabel: string;
  readonly langAttr?: string;
  readonly onClick: () => void;
}): React.JSX.Element {
  const activeStyle = active
    ? "border-sky-600 bg-sky-600 text-white"
    : "border-slate-300 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300";
  return (
    <button
      type="button"
      lang={langAttr}
      onClick={onClick}
      aria-pressed={active}
      aria-label={ariaLabel}
      className={`min-h-[44px] min-w-[44px] rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${activeStyle}`}
    >
      {label}
    </button>
  );
}

function LanguageSwitcher({ language, onLanguageChange }: HeaderProps): React.JSX.Element {
  return (
    <div className="flex items-center gap-2" role="group" aria-label="Language selection">
      <span className="mr-1 hidden text-xs font-medium text-slate-500 sm:inline dark:text-slate-400">
        Language:
      </span>
      <LanguageButton
        active={language === "en"}
        label="EN"
        ariaLabel="English"
        onClick={() => onLanguageChange("en")}
      />
      <LanguageButton
        active={language === "hi"}
        label="हिन्दी"
        ariaLabel="Hindi (हिन्दी)"
        langAttr="hi"
        onClick={() => onLanguageChange("hi")}
      />
    </div>
  );
}

export function Header({ language, onLanguageChange }: HeaderProps): React.JSX.Element {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur transition-colors dark:border-slate-800 dark:bg-slate-900/95">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:z-50 focus:rounded-lg focus:bg-sky-600 focus:p-3 focus:text-white"
        >
          Skip to main content
        </a>
        <div className="flex items-center gap-3">
          <div
            className="rounded-xl bg-sky-100 p-2 text-sky-700 dark:bg-sky-950 dark:text-sky-300"
            aria-hidden="true"
          >
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Smog<span className="text-sky-600 dark:text-sky-400">Shield</span>
            </span>
            <p className="hidden text-xs text-slate-500 sm:block dark:text-slate-400">
              Urban Air Quality & Smog Assistant
            </p>
          </div>
        </div>
        <LanguageSwitcher language={language} onLanguageChange={onLanguageChange} />
      </div>
    </header>
  );
}
