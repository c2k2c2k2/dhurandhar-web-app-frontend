import * as React from "react";
import { cn } from "@/lib/utils";

type AuthFormFieldProps = {
  label: string;
  error?: string | null;
  helper?: string;
  children: React.ReactNode;
};

export function AuthFormField({
  label,
  error,
  helper,
  children,
}: AuthFormFieldProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">{label}</label>
      <div
        className={cn(error && "rounded-2xl ring-1 ring-destructive/30")}
      >
        {children}
      </div>
      {error ? (
        <p className="text-xs text-destructive">{error}</p>
      ) : helper ? (
        <p className="text-xs text-muted-foreground">{helper}</p>
      ) : null}
    </div>
  );
}
