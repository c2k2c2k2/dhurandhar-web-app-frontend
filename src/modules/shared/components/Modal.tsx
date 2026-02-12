"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export function Modal({
  open,
  title,
  description,
  onOpenChange,
  children,
  footer,
  className,
}: {
  open: boolean;
  title: string;
  description?: string;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}) {
  React.useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onOpenChange(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onOpenChange]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 px-4"
      role="dialog"
      aria-modal="true"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onOpenChange(false);
        }
      }}
    >
      <div
        className={cn(
          "w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-sm",
          className
        )}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">{title}</h2>
            {description ? (
              <p className="mt-1 text-sm text-muted-foreground">
                {description}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-4">{children}</div>
        {footer ? <div className="mt-6 flex justify-end gap-2">{footer}</div> : null}
      </div>
    </div>
  );
}
