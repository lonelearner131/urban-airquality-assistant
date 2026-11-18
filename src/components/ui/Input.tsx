import React from "react";

/**
 * @fileoverview Accessible Form Input primitive with integrated label and error descriptions.
 * Enforces WCAG 2.2 touch targets and aria-describedby binding.
 */

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  readonly label: string;
  readonly error?: string;
  readonly helperText?: string;
}

function resolveDescribedBy(
  errorId: string,
  helperId: string,
  hasError: boolean,
  hasHelper: boolean,
): string | undefined {
  if (hasError) return errorId;
  if (hasHelper) return helperId;
  return undefined;
}

function InputMessage({
  error,
  errorId,
  helperText,
  helperId,
}: {
  readonly error?: string | undefined;
  readonly errorId: string;
  readonly helperText?: string | undefined;
  readonly helperId: string;
}): React.JSX.Element | null {
  if (error) {
    return (
      <span
        id={errorId}
        role="alert"
        className="text-xs font-medium text-rose-600 dark:text-rose-400"
      >
        {error}
      </span>
    );
  }
  if (helperText) {
    return (
      <span id={helperId} className="text-xs text-slate-500 dark:text-slate-400">
        {helperText}
      </span>
    );
  }
  return null;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, helperText, id, className = "", ...props },
  ref,
) {
  const generatedId = React.useId();
  const inputId = id ?? generatedId;
  const errorId = `${inputId}-error`;
  const helperId = `${inputId}-helper`;
  const describedBy = resolveDescribedBy(errorId, helperId, Boolean(error), Boolean(helperText));
  const borderClass = error
    ? "border-rose-500 dark:border-rose-400"
    : "border-slate-300 dark:border-slate-700";

  return (
    <div className="flex w-full flex-col gap-1.5">
      <label htmlFor={inputId} className="text-sm font-medium text-slate-800 dark:text-slate-200">
        {label}
      </label>
      <input
        ref={ref}
        id={inputId}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
        className={`min-h-[44px] w-full rounded-lg border bg-white px-3.5 py-2.5 text-base text-slate-900 transition-colors placeholder:text-slate-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-sky-500 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 ${borderClass} ${className}`.trim()}
        {...props}
      />
      <InputMessage error={error} errorId={errorId} helperText={helperText} helperId={helperId} />
    </div>
  );
});
