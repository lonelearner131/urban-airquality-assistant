import React from "react";
import Link from "next/link";
import { Home, ShieldQuestion } from "lucide-react";

export default function NotFound(): React.JSX.Element {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6 dark:bg-slate-950">
      <div className="flex w-full max-w-md flex-col items-center gap-4 rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="rounded-2xl bg-sky-100 p-3 text-sky-600 dark:bg-sky-950/60 dark:text-sky-400">
          <ShieldQuestion className="h-8 w-8" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Page Not Found</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            The requested air quality resource does not exist.
          </p>
        </div>
        <Link
          href="/"
          className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-sky-600 px-4 py-2.5 text-base font-medium text-white transition-colors hover:bg-sky-700"
        >
          <Home className="h-4 w-4" aria-hidden="true" />
          <span>Return Home</span>
        </Link>
      </div>
    </main>
  );
}
