import React from "react";

/**
 * @fileoverview Accessible Skeleton loading placeholder primitive.
 */

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  readonly width?: string;
  readonly height?: string;
}

export function Skeleton({
  className = "",
  style,
  width,
  height,
  ...props
}: SkeletonProps): React.JSX.Element {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800 ${className}`.trim()}
      style={{ width, height, ...style }}
      {...props}
    />
  );
}
