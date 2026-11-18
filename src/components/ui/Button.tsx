import React from "react";

/**
 * @fileoverview Accessible, reusable Button primitive.
 * Enforces minimum 44px touch target size and visible keyboard focus indicator.
 */

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  readonly variant?: "primary" | "secondary" | "outline" | "ghost";
  readonly size?: "sm" | "md" | "lg";
  readonly isLoading?: boolean;
}

const VARIANT_CLASSES: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary:
    "bg-sky-600 text-white hover:bg-sky-700 active:bg-sky-800 dark:bg-sky-500 dark:hover:bg-sky-600 border border-transparent shadow-sm",
  secondary:
    "bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800 dark:bg-emerald-500 dark:hover:bg-emerald-600 border border-transparent shadow-sm",
  outline:
    "bg-transparent text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800",
  ghost:
    "bg-transparent text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent",
};

const SIZE_CLASSES: Record<NonNullable<ButtonProps["size"]>, string> = {
  sm: "min-h-[44px] px-3 py-2 text-sm",
  md: "min-h-[44px] px-4 py-2.5 text-base",
  lg: "min-h-[48px] px-6 py-3 text-lg font-medium",
};

function ButtonSpinner(): React.JSX.Element {
  return (
    <span className="inline-flex items-center gap-2">
      <svg
        className="-ml-1 mr-2 h-4 w-4 animate-spin text-current"
        fill="none"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      <span>Loading...</span>
    </span>
  );
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = "primary",
    size = "md",
    isLoading = false,
    children,
    className = "",
    disabled,
    ...props
  },
  ref,
) {
  const baseClasses =
    "inline-flex items-center justify-center font-medium rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none";
  const variantClass = VARIANT_CLASSES[variant];
  const sizeClass = SIZE_CLASSES[size];

  return (
    <button
      ref={ref}
      disabled={disabled || isLoading}
      className={`${baseClasses} ${variantClass} ${sizeClass} ${className}`.trim()}
      {...props}
    >
      {isLoading ? <ButtonSpinner /> : children}
    </button>
  );
});
