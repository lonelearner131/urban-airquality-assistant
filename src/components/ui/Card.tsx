import React from "react";

/**
 * @fileoverview Accessible Card container primitive.
 * Semantic grouping container with high-contrast borders and elevated surfaces.
 */

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  readonly as?: "article" | "section" | "div";
}

export function Card({
  as: Component = "div",
  className = "",
  children,
  ...props
}: CardProps): React.JSX.Element {
  return (
    <Component
      className={`rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow dark:border-slate-800 dark:bg-slate-900 ${className}`.trim()}
      {...props}
    >
      {children}
    </Component>
  );
}

export function CardHeader({
  className = "",
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>): React.JSX.Element {
  return (
    <div className={`mb-4 flex items-center justify-between gap-3 ${className}`.trim()} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({
  className = "",
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>): React.JSX.Element {
  return (
    <h3
      className={`text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-100 ${className}`.trim()}
      {...props}
    >
      {children}
    </h3>
  );
}
