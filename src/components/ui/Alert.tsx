import React from "react";

/**
 * @fileoverview Accessible Alert status notification banner.
 */

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  readonly variant?: "info" | "warning" | "danger" | "success";
  readonly title?: string;
}

const ALERT_VARIANTS: Record<NonNullable<AlertProps["variant"]>, string> = {
  info: "bg-sky-50 border-sky-300 text-sky-950 dark:bg-sky-950/60 dark:border-sky-800 dark:text-sky-200",
  warning:
    "bg-amber-50 border-amber-300 text-amber-950 dark:bg-amber-950/60 dark:border-amber-800 dark:text-amber-200",
  danger:
    "bg-rose-50 border-rose-300 text-rose-950 dark:bg-rose-950/60 dark:border-rose-800 dark:text-rose-200",
  success:
    "bg-emerald-50 border-emerald-300 text-emerald-950 dark:bg-emerald-950/60 dark:border-emerald-800 dark:text-emerald-200",
};

export function Alert({
  variant = "info",
  title,
  children,
  className = "",
  ...props
}: AlertProps): React.JSX.Element {
  const variantClass = ALERT_VARIANTS[variant];
  return (
    <div
      role="alert"
      className={`flex flex-col gap-1 rounded-xl border p-4 text-sm ${variantClass} ${className}`.trim()}
      {...props}
    >
      {title && <span className="font-semibold">{title}</span>}
      <div>{children}</div>
    </div>
  );
}
