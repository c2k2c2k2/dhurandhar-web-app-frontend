"use client";

import * as React from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { FormField } from "./FormField";
import {
  createStructuredObjectEntry,
  type StructuredObjectEntry,
  type StructuredValueType,
} from "../structured-data";

function typeLabel(type: StructuredValueType) {
  if (type === "text") return "Text";
  if (type === "number") return "Number";
  if (type === "boolean") return "Yes / No";
  return "List";
}

export function StringListEditor({
  label,
  description,
  values,
  onChange,
  itemLabel = "Item",
  addLabel = "Add item",
  emptyLabel = "No items added yet.",
  className,
}: {
  label: string;
  description?: string;
  values: string[];
  onChange: (next: string[]) => void;
  itemLabel?: string;
  addLabel?: string;
  emptyLabel?: string;
  className?: string;
}) {
  const updateValue = (index: number, value: string) => {
    const next = [...values];
    next[index] = value;
    onChange(next);
  };

  const removeValue = (index: number) => {
    onChange(values.filter((_, currentIndex) => currentIndex !== index));
  };

  const addValue = () => {
    onChange([...values, ""]);
  };

  return (
    <FormField label={label} description={description}>
      <div className={cn("space-y-3 rounded-2xl border border-border bg-card/40 p-3", className)}>
        {values.length === 0 ? (
          <p className="text-sm text-muted-foreground">{emptyLabel}</p>
        ) : (
          values.map((value, index) => (
            <div key={`${label}-${index}`} className="flex items-center gap-2">
              <Input
                value={value}
                placeholder={`${itemLabel} ${index + 1}`}
                onChange={(event) => updateValue(index, event.target.value)}
              />
              <Button type="button" variant="ghost" size="icon" onClick={() => removeValue(index)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))
        )}
        <Button type="button" variant="secondary" size="sm" onClick={addValue}>
          <Plus className="h-4 w-4" />
          {addLabel}
        </Button>
      </div>
    </FormField>
  );
}

export function StructuredObjectEditor({
  label,
  description,
  entries,
  onChange,
  addLabel = "Add field",
  emptyLabel = "No extra fields added yet.",
  preserveNotice,
}: {
  label: string;
  description?: string;
  entries: StructuredObjectEntry[];
  onChange: (next: StructuredObjectEntry[]) => void;
  addLabel?: string;
  emptyLabel?: string;
  preserveNotice?: string;
}) {
  const updateEntry = (
    index: number,
    patch: Partial<StructuredObjectEntry>
  ) => {
    const next = [...entries];
    next[index] = { ...next[index], ...patch };
    onChange(next);
  };

  const removeEntry = (index: number) => {
    onChange(entries.filter((_, currentIndex) => currentIndex !== index));
  };

  const addEntry = () => {
    onChange([...entries, createStructuredObjectEntry()]);
  };

  return (
    <FormField label={label} description={description}>
      <div className="space-y-3 rounded-2xl border border-border bg-card/40 p-3">
        {preserveNotice ? (
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-900">
            {preserveNotice}
          </div>
        ) : null}

        {entries.length === 0 ? (
          <p className="text-sm text-muted-foreground">{emptyLabel}</p>
        ) : (
          entries.map((entry, index) => (
            <div key={entry.id} className="rounded-2xl border border-border bg-background/70 p-3">
              <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_160px_auto]">
                <Input
                  placeholder="Field name"
                  value={entry.key}
                  onChange={(event) => updateEntry(index, { key: event.target.value })}
                />
                <select
                  className="h-10 rounded-2xl border border-input bg-background px-3 text-sm text-foreground"
                  value={entry.type}
                  onChange={(event) =>
                    updateEntry(index, {
                      type: event.target.value as StructuredValueType,
                      textValue:
                        event.target.value === "number" ? entry.textValue : entry.textValue,
                      listValue: event.target.value === "list" ? entry.listValue : [],
                      booleanValue:
                        event.target.value === "boolean" ? entry.booleanValue : false,
                    })
                  }
                >
                  {(["text", "number", "boolean", "list"] as const).map((type) => (
                    <option key={type} value={type}>
                      {typeLabel(type)}
                    </option>
                  ))}
                </select>
                <Button type="button" variant="ghost" size="icon" onClick={() => removeEntry(index)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="mt-3">
                {entry.type === "boolean" ? (
                  <label className="flex items-center gap-2 text-sm text-foreground">
                    <input
                      type="checkbox"
                      checked={entry.booleanValue}
                      onChange={(event) =>
                        updateEntry(index, { booleanValue: event.target.checked })
                      }
                    />
                    Enabled
                  </label>
                ) : entry.type === "list" ? (
                  <StringListEditor
                    label="Values"
                    values={entry.listValue}
                    onChange={(next) => updateEntry(index, { listValue: next })}
                    itemLabel="Value"
                    addLabel="Add value"
                    emptyLabel="No values added yet."
                  />
                ) : (
                  <Input
                    type={entry.type === "number" ? "number" : "text"}
                    placeholder={entry.type === "number" ? "Enter number" : "Enter value"}
                    value={entry.textValue}
                    onChange={(event) => updateEntry(index, { textValue: event.target.value })}
                  />
                )}
              </div>
            </div>
          ))
        )}

        <Button type="button" variant="secondary" size="sm" onClick={addEntry}>
          <Plus className="h-4 w-4" />
          {addLabel}
        </Button>
      </div>
    </FormField>
  );
}
