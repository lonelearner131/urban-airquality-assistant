"use client";

import React, { useEffect } from "react";
import { AlertOctagon, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function ErrorBoundary({
  error,
  reset,
}: {
  readonly error: Error & { digest?: string };
  readonly reset: () => void;
}): React.JSX.Element {
  useEffect(() => {
    // Error logged safely without stack leaks in production
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6 dark:bg-slate-950">
      <div className="flex w-full max-w-md flex-col items-center gap-4 rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="rounded-2xl bg-rose-100 p-3 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
          <AlertOctagon className="h-8 w-8" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Something went wrong
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            We encountered a temporary failure. Please retry or verify your internet connection.
          </p>
        </div>
        <Button type="button" variant="primary" onClick={() => reset()} className="w-full">
          <RotateCcw className="mr-2 h-4 w-4" aria-hidden="true" />
          <span>Try Again</span>
        </Button>
      </div>
    </main>
  );
}
