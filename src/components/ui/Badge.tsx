import React from "react";

/**
 * @fileoverview Accessible Badge token primitive.
 * High-contrast semantic tag indicator.
 */

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  readonly variant?: "default" | "success" | "warning" | "danger" | "info";
}

const BADGE_VARIANTS: Record<NonNullable<BadgeProps["variant"]>, string> = {
  default:
    "bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700",
  success:
    "bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800",
  warning:
    "bg-amber-50 text-amber-900 border-amber-300 dark:bg-amber-950 dark:text-amber-200 dark:border-amber-800",
  danger:
    "bg-rose-50 text-rose-900 border-rose-300 dark:bg-rose-950 dark:text-rose-200 dark:border-rose-800",
  info: "bg-sky-50 text-sky-900 border-sky-300 dark:bg-sky-950 dark:text-sky-200 dark:border-sky-800",
};

export function Badge({
  variant = "default",
  className = "",
  children,
  ...props
}: BadgeProps): React.JSX.Element {
  const variantClass = BADGE_VARIANTS[variant];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${variantClass} ${className}`.trim()}
      {...props}
    >
      {children}
    </span>
  );
}
