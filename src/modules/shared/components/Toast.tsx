"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastVariant = "default" | "destructive";

type ToastMessage = {
  id: string;
  title: string;
  description?: string;
  variant?: ToastVariant;
};

type ToastContextValue = {
  toast: (message: Omit<ToastMessage, "id">) => void;
};

const ToastContext = React.createContext<ToastContextValue | undefined>(
  undefined
);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastMessage[]>([]);

  const toast = React.useCallback(
    (message: Omit<ToastMessage, "id">) => {
      const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
      setToasts((prev) => [...prev, { ...message, id }]);
      window.setTimeout(() => {
        setToasts((prev) => prev.filter((toastItem) => toastItem.id !== id));
      }, 4000);
    },
    []
  );

  const dismiss = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((toastItem) => toastItem.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-50 flex w-full max-w-sm flex-col gap-3 px-4">
        {toasts.map((toastItem) => (
          <div
            key={toastItem.id}
            className={cn(
              "rounded-2xl border border-border bg-card p-4 text-sm shadow-sm",
              toastItem.variant === "destructive"
                ? "border-destructive/40 text-destructive"
                : "text-foreground"
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold">{toastItem.title}</p>
                {toastItem.description ? (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {toastItem.description}
                  </p>
                ) : null}
              </div>
              <button
                type="button"
                className="text-muted-foreground hover:text-foreground"
                onClick={() => dismiss(toastItem.id)}
                aria-label="Dismiss"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}
