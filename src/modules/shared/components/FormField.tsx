"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function FormField({
  label,
  description,
  error,
  children,
}: {
  label: string;
  description?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-foreground">{label}</label>
        {error ? <span className="text-xs text-destructive">{error}</span> : null}
      </div>
      {children}
      {description ? (
        <p className="text-xs text-muted-foreground">{description}</p>
      ) : null}
    </div>
  );
}

export function FormInput({
  label,
  description,
  error,
  ...props
}: React.ComponentProps<typeof Input> & {
  label: string;
  description?: string;
  error?: string;
}) {
  return (
    <FormField label={label} description={description} error={error}>
      <Input {...props} />
    </FormField>
  );
}

export function FormSelect({
  label,
  description,
  error,
  className,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  description?: string;
  error?: string;
}) {
  return (
    <FormField label={label} description={description} error={error}>
      <select
        className={cn(
          "flex h-10 w-full rounded-2xl border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          className
        )}
        {...props}
      >
        {children}
      </select>
    </FormField>
  );
}

export function FormTextarea({
  label,
  description,
  error,
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  description?: string;
  error?: string;
}) {
  return (
    <FormField label={label} description={description} error={error}>
      <textarea
        className={cn(
          "min-h-[120px] w-full rounded-2xl border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          className
        )}
        {...props}
      />
    </FormField>
  );
}

export function FormSwitch({
  label,
  description,
  checked,
  onCheckedChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onCheckedChange: (value: boolean) => void;
}) {
  return (
    <FormField label={label} description={description}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onCheckedChange(!checked)}
        className={cn(
          "relative h-6 w-11 rounded-full border border-border transition-colors",
          checked ? "bg-primary" : "bg-muted"
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 h-5 w-5 rounded-full bg-background transition-transform",
            checked ? "translate-x-5" : "translate-x-0.5"
          )}
        />
      </button>
    </FormField>
  );
}
