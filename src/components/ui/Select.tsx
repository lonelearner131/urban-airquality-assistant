import React from "react";

/**
 * @fileoverview Accessible Select primitive with integrated label and options rendering.
 */

export interface SelectOption {
  readonly value: string;
  readonly label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  readonly label: string;
  readonly options: readonly SelectOption[];
  readonly error?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, options, error, id, className = "", ...props },
  ref,
) {
  const generatedId = React.useId();
  const selectId = id ?? generatedId;
  const errorId = `${selectId}-error`;

  return (
    <div className="flex w-full flex-col gap-1.5">
      <label htmlFor={selectId} className="text-sm font-medium text-slate-800 dark:text-slate-200">
        {label}
      </label>
      <select
        ref={ref}
        id={selectId}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className={`min-h-[44px] w-full rounded-lg border bg-white px-3.5 py-2.5 text-base text-slate-900 transition-colors focus:border-transparent focus:outline-none focus:ring-2 focus:ring-sky-500 dark:bg-slate-900 dark:text-slate-100 ${
          error ? "border-rose-500" : "border-slate-300 dark:border-slate-700"
        } ${className}`.trim()}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <span
          id={errorId}
          role="alert"
          className="text-xs font-medium text-rose-600 dark:text-rose-400"
        >
          {error}
        </span>
      )}
    </div>
  );
});
