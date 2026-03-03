"use client";

export type StructuredValueType = "text" | "number" | "boolean" | "list";

export type StructuredObjectEntry = {
  id: string;
  key: string;
  type: StructuredValueType;
  textValue: string;
  booleanValue: boolean;
  listValue: string[];
};

export function createStructuredId(prefix = "item") {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

export function createStructuredObjectEntry(
  partial?: Partial<StructuredObjectEntry>
): StructuredObjectEntry {
  return {
    id: partial?.id || createStructuredId("field"),
    key: partial?.key || "",
    type: partial?.type || "text",
    textValue: partial?.textValue || "",
    booleanValue: partial?.booleanValue ?? false,
    listValue: partial?.listValue || [],
  };
}

function isStringList(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

export function splitStructuredRecord(
  value: unknown,
  reservedKeys: string[] = []
): {
  entries: StructuredObjectEntry[];
  preserved: Record<string, unknown>;
  hasUnsupported: boolean;
} {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {
      entries: [],
      preserved: {},
      hasUnsupported: false,
    };
  }

  const entries: StructuredObjectEntry[] = [];
  const preserved: Record<string, unknown> = {};
  let hasUnsupported = false;

  Object.entries(value as Record<string, unknown>).forEach(([key, entry]) => {
    if (reservedKeys.includes(key)) {
      preserved[key] = entry;
      return;
    }

    if (typeof entry === "string") {
      entries.push(
        createStructuredObjectEntry({
          key,
          type: "text",
          textValue: entry,
        })
      );
      return;
    }

    if (typeof entry === "number") {
      entries.push(
        createStructuredObjectEntry({
          key,
          type: "number",
          textValue: String(entry),
        })
      );
      return;
    }

    if (typeof entry === "boolean") {
      entries.push(
        createStructuredObjectEntry({
          key,
          type: "boolean",
          booleanValue: entry,
        })
      );
      return;
    }

    if (isStringList(entry)) {
      entries.push(
        createStructuredObjectEntry({
          key,
          type: "list",
          listValue: entry,
        })
      );
      return;
    }

    preserved[key] = entry;
    hasUnsupported = true;
  });

  return { entries, preserved, hasUnsupported };
}

export function buildStructuredRecord(
  entries: StructuredObjectEntry[],
  preserved: Record<string, unknown> = {}
) {
  const record: Record<string, unknown> = { ...preserved };

  entries.forEach((entry) => {
    const key = entry.key.trim();
    if (!key) {
      return;
    }

    if (entry.type === "boolean") {
      record[key] = entry.booleanValue;
      return;
    }

    if (entry.type === "list") {
      const values = entry.listValue.map((item) => item.trim()).filter(Boolean);
      if (values.length > 0) {
        record[key] = values;
      }
      return;
    }

    const raw = entry.textValue.trim();
    if (!raw) {
      return;
    }

    if (entry.type === "number") {
      const parsed = Number(raw);
      if (!Number.isNaN(parsed)) {
        record[key] = parsed;
      }
      return;
    }

    record[key] = raw;
  });

  return record;
}

export function parseStringList(value: unknown) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(/[\n,]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

export function splitPresetConfig(value: unknown) {
  if (Array.isArray(value)) {
    return {
      presets: value,
      preserved: {} as Record<string, unknown>,
    };
  }

  if (value && typeof value === "object") {
    const objectValue = value as Record<string, unknown>;
    const { presets, ...preserved } = objectValue;
    return {
      presets: Array.isArray(presets) ? presets : [],
      preserved,
    };
  }

  return {
    presets: [],
    preserved: {} as Record<string, unknown>,
  };
}
