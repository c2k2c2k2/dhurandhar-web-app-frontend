"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export function FiltersBar({
  filters,
  actions,
  className,
}: {
  filters?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card px-4 py-3",
        className
      )}
    >
      <div className="flex flex-wrap items-center gap-2">{filters}</div>
      <div className="flex flex-wrap items-center gap-2">{actions}</div>
    </div>
  );
}
