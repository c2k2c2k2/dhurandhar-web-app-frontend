"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function EmptyState({
  title,
  description,
  action,
  className,
}: {
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-border bg-card px-6 py-10 text-center",
        className
      )}
    >
      <h2 className="text-lg font-semibold">{title}</h2>
      {description ? (
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      ) : null}
      {action ? (
        <Button className="mt-4" variant="secondary" onClick={action.onClick}>
          {action.label}
        </Button>
      ) : null}
    </div>
  );
}

export function LoadingState({
  label = "Loading...",
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-border bg-card px-6 py-10 text-center",
        className
      )}
    >
      <div className="h-10 w-10 animate-pulse rounded-full bg-muted" />
      <p className="mt-3 text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

export function ErrorState({
  title = "Something went wrong",
  description,
  onRetry,
  className,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-destructive/40 bg-card px-6 py-10 text-center",
        className
      )}
    >
      <h2 className="text-lg font-semibold text-destructive">{title}</h2>
      {description ? (
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      ) : null}
      {onRetry ? (
        <Button className="mt-4" variant="secondary" onClick={onRetry}>
          Retry
        </Button>
      ) : null}
    </div>
  );
}
