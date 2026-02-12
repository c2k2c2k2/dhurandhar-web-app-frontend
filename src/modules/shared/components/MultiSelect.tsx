"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { FormField } from "./FormField";
import { Modal } from "./Modal";

export type MultiSelectItem = {
  id: string;
  label: string;
};

export function MultiSelectField({
  label,
  description,
  items,
  value,
  onChange,
  loading = false,
  loadingLabel = "Loading options...",
  emptyLabel = "No options available.",
  searchPlaceholder = "Search...",
  modalTitle = "Select items",
  modalDescription,
  selectLabel = "Select",
  editLabel = "Edit",
  clearLabel = "Clear all",
  maxBadgeCount = 8,
  disabled = false,
}: {
  label: string;
  description?: string;
  items: MultiSelectItem[];
  value: string[];
  onChange: (next: string[]) => void;
  loading?: boolean;
  loadingLabel?: string;
  emptyLabel?: string;
  searchPlaceholder?: string;
  modalTitle?: string;
  modalDescription?: string;
  selectLabel?: string;
  editLabel?: string;
  clearLabel?: string;
  maxBadgeCount?: number;
  disabled?: boolean;
}) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");

  React.useEffect(() => {
    if (open) {
      setQuery("");
    }
  }, [open]);

  const itemMap = React.useMemo(() => new Map(items.map((item) => [item.id, item.label])), [items]);

  const selectedLabels = React.useMemo(
    () => value.map((id) => itemMap.get(id) || id).filter(Boolean),
    [value, itemMap]
  );

  const filteredItems = query
    ? items.filter((item) => item.label.toLowerCase().includes(query.toLowerCase()))
    : items;

  const toggle = (itemId: string) => {
    const checked = value.includes(itemId);
    const next = checked ? value.filter((id) => id !== itemId) : [...value, itemId];
    onChange(next);
  };

  return (
    <FormField label={label} description={description}>
      {loading ? (
        <p className="text-sm text-muted-foreground">{loadingLabel}</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-muted-foreground">{emptyLabel}</p>
      ) : (
        <div className="space-y-3">
          {selectedLabels.length === 0 ? (
            <p className="text-sm text-muted-foreground">No items selected yet.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {selectedLabels.slice(0, maxBadgeCount).map((itemLabel, index) => (
                <span
                  key={`${itemLabel}-${index}`}
                  className="rounded-full bg-muted px-2 py-1 text-xs text-foreground"
                >
                  {itemLabel}
                </span>
              ))}
              {selectedLabels.length > maxBadgeCount ? (
                <span className="text-xs text-muted-foreground">
                  +{selectedLabels.length - maxBadgeCount} more
                </span>
              ) : null}
            </div>
          )}
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              disabled={disabled}
              onClick={() => setOpen(true)}
            >
              {value.length ? `${editLabel}` : `${selectLabel}`}
            </Button>
            {value.length > 0 ? (
              <Button
                type="button"
                variant="ghost"
                disabled={disabled}
                onClick={() => onChange([])}
              >
                {clearLabel}
              </Button>
            ) : null}
            <span className="text-xs text-muted-foreground">
              {value.length} selected
            </span>
          </div>
          <Modal
            open={open}
            onOpenChange={setOpen}
            title={modalTitle}
            description={modalDescription}
            footer={
              <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
                Done
              </Button>
            }
          >
            <div className="space-y-3">
              <Input
                placeholder={searchPlaceholder}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                autoFocus
              />
              <div className="max-h-72 overflow-y-auto rounded-2xl border border-border bg-background p-2">
                {filteredItems.length === 0 ? (
                  <p className="px-3 py-2 text-sm text-muted-foreground">
                    No options match your search.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {filteredItems.map((item) => {
                      const checked = value.includes(item.id);
                      return (
                        <label
                          key={item.id}
                          className={cn(
                            "flex items-center gap-2 rounded-2xl px-3 py-2 text-sm hover:bg-muted",
                            disabled && "cursor-not-allowed opacity-60"
                          )}
                        >
                          <input
                            type="checkbox"
                            className="h-4 w-4"
                            checked={checked}
                            disabled={disabled}
                            onChange={() => toggle(item.id)}
                          />
                          <span>{item.label}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
              <div className="text-xs text-muted-foreground">
                {filteredItems.length} options shown
              </div>
            </div>
          </Modal>
        </div>
      )}
    </FormField>
  );
}
