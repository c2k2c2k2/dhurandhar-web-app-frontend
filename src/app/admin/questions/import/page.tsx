"use client";

import * as React from "react";
import { RequirePerm } from "@/lib/auth/guards";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/modules/shared/components/PageHeader";
import { FormField, FormTextarea } from "@/modules/shared/components/FormField";
import { ErrorState } from "@/modules/shared/components/States";
import { useToast } from "@/modules/shared/components/Toast";
import { useBulkImportQuestions } from "@/modules/questions/hooks";
import type {
  QuestionCreateInput,
  QuestionDifficulty,
  QuestionType,
} from "@/modules/questions/types";
import { buildContent } from "@/modules/questions/utils";

type ParseError = {
  row: number;
  message: string;
};

const TYPE_MAP: Record<string, QuestionType> = {
  SINGLE_CHOICE: "SINGLE_CHOICE",
  SINGLE: "SINGLE_CHOICE",
  MULTI_CHOICE: "MULTI_CHOICE",
  MULTI: "MULTI_CHOICE",
  TRUE_FALSE: "TRUE_FALSE",
  TRUEFALSE: "TRUE_FALSE",
  BOOLEAN: "TRUE_FALSE",
  INTEGER: "INTEGER",
  SHORT_ANSWER: "SHORT_ANSWER",
  SHORT: "SHORT_ANSWER",
};

const DIFFICULTY_MAP: Record<string, QuestionDifficulty> = {
  EASY: "EASY",
  MEDIUM: "MEDIUM",
  HARD: "HARD",
};

function parseCsvRows(text: string): string[][] {
  const rows: string[][] = [];
  let current = "";
  let row: string[] = [];
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];
    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (char === "," && !inQuotes) {
      row.push(current.trim());
      current = "";
      continue;
    }
    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") {
        i += 1;
      }
      row.push(current.trim());
      current = "";
      if (row.length > 1 || row[0]) {
        rows.push(row);
      }
      row = [];
      continue;
    }
    current += char;
  }

  if (current.length || row.length) {
    row.push(current.trim());
    rows.push(row);
  }

  return rows;
}

function normalizeType(raw?: string) {
  if (!raw) return undefined;
  const key = raw.trim().toUpperCase().replace(/\s+/g, "_");
  return TYPE_MAP[key];
}

function normalizeDifficulty(raw?: string) {
  if (!raw) return undefined;
  const key = raw.trim().toUpperCase();
  return DIFFICULTY_MAP[key];
}

function normalizeBoolean(raw?: string) {
  if (!raw) return undefined;
  const value = raw.trim().toLowerCase();
  if (value === "true" || value === "yes" || value === "1") return true;
  if (value === "false" || value === "no" || value === "0") return false;
  return undefined;
}

function parseOptionIndex(raw?: string) {
  if (!raw) return undefined;
  const trimmed = raw.trim();
  if (!trimmed) return undefined;
  const letter = trimmed.toUpperCase();
  if (["A", "B", "C", "D"].includes(letter)) {
    return letter.charCodeAt(0) - "A".charCodeAt(0);
  }
  const numeric = Number(trimmed);
  if (!Number.isNaN(numeric)) {
    if (numeric >= 1 && numeric <= 4) {
      return numeric - 1;
    }
    if (numeric >= 0 && numeric <= 3) {
      return numeric;
    }
  }
  return undefined;
}

function buildOptionsFromCsv(row: Record<string, string>) {
  const labels = ["A", "B", "C", "D"];
  const options = labels.map((label) => {
    const text = row[`option${label}Text`] || row[`option${label}`] || "";
    const imageAssetId =
      row[`option${label}ImageAssetId`] || row[`option${label}Image`] || "";
    const content = buildContent(text, imageAssetId || undefined);
    return content ?? { text: "" };
  });

  const hasAny = options.some((option) =>
    Boolean(option.text || option.imageAssetId)
  );

  return hasAny ? { options } : undefined;
}

function buildAnswerFromCsv(type: QuestionType, row: Record<string, string>) {
  const raw = row.correctOption || row.correctAnswer || row.answer || "";

  if (type === "MULTI_CHOICE") {
    const parts = raw.split(/[|,; ]/).map((value) => value.trim()).filter(Boolean);
    const indexes = parts
      .map(parseOptionIndex)
      .filter((value): value is number => typeof value === "number");
    return indexes.length ? { optionIndexes: indexes } : undefined;
  }

  if (type === "SINGLE_CHOICE") {
    const index = parseOptionIndex(raw);
    return typeof index === "number" ? { optionIndex: index } : undefined;
  }

  if (type === "TRUE_FALSE") {
    const boolValue = normalizeBoolean(raw);
    return typeof boolValue === "boolean" ? { value: boolValue } : undefined;
  }

  const value = raw.trim();
  if (!value) return undefined;
  if (type === "INTEGER") {
    const numeric = Number(value);
    return { value: Number.isNaN(numeric) ? value : numeric };
  }
  return { value };
}

function parseCsvToItems(text: string) {
  const rows = parseCsvRows(text);
  if (!rows.length) {
    return { items: [], errors: [{ row: 0, message: "CSV file is empty." }] };
  }

  const [headerRow, ...dataRows] = rows;
  const headers = headerRow.map((header) => header.trim());
  const items: QuestionCreateInput[] = [];
  const errors: ParseError[] = [];

  dataRows.forEach((rowValues, index) => {
    const rowIndex = index + 2;
    const row: Record<string, string> = {};
    headers.forEach((header, colIndex) => {
      row[header] = rowValues[colIndex] ?? "";
    });

    const type = normalizeType(row.type);
    const subjectId = row.subjectId?.trim();
    if (!subjectId) {
      errors.push({ row: rowIndex, message: "subjectId is required." });
      return;
    }
    if (!type) {
      errors.push({ row: rowIndex, message: "type is invalid or missing." });
      return;
    }

    const statementText = row.statementText || row.statement || "";
    const statementImageAssetId =
      row.statementImageAssetId || row.statementImage || "";
    const statementJson =
      buildContent(statementText, statementImageAssetId || undefined) ??
      undefined;

    if (!statementJson) {
      errors.push({ row: rowIndex, message: "statementText is required." });
      return;
    }

    const difficulty = normalizeDifficulty(row.difficulty);
    const explanationText = row.explanationText || row.explanation || "";
    const explanationImageAssetId =
      row.explanationImageAssetId || row.explanationImage || "";
    const explanationJson = buildContent(
      explanationText,
      explanationImageAssetId || undefined
    );

    const item: QuestionCreateInput = {
      subjectId,
      topicId: row.topicId?.trim() || undefined,
      type,
      difficulty,
      statementJson,
      optionsJson: buildOptionsFromCsv(row),
      explanationJson: explanationJson || undefined,
      correctAnswerJson: buildAnswerFromCsv(type, row),
      isPublished: normalizeBoolean(row.isPublished || row.published) ?? false,
    };

    items.push(item);
  });

  return { items, errors };
}

function parseJsonToItems(text: string) {
  try {
    const data = JSON.parse(text) as unknown;
    const list = Array.isArray(data)
      ? data
      : data && typeof data === "object" && Array.isArray((data as { items?: unknown }).items)
        ? (data as { items: unknown[] }).items
        : [];

    if (!Array.isArray(list) || list.length === 0) {
      return { items: [], errors: [{ row: 0, message: "JSON must contain an items array." }] };
    }

    const errors: ParseError[] = [];
    const items = list
      .map((item, index) => {
        if (!item || typeof item !== "object") {
          errors.push({ row: index + 1, message: "Row is not an object." });
          return null;
        }
        const typed = item as QuestionCreateInput;
        if (!typed.subjectId || !typed.type || !typed.statementJson) {
          errors.push({
            row: index + 1,
            message: "subjectId, type, and statementJson are required.",
          });
          return null;
        }
        return typed;
      })
      .filter((item): item is QuestionCreateInput => Boolean(item));

    return { items, errors };
  } catch (err) {
    return { items: [], errors: [{ row: 0, message: "Invalid JSON file." }] };
  }
}

export default function AdminQuestionImportPage() {
  const { toast } = useToast();
  const [fileName, setFileName] = React.useState("");
  const [items, setItems] = React.useState<QuestionCreateInput[]>([]);
  const [errors, setErrors] = React.useState<ParseError[]>([]);
  const [rawPreview, setRawPreview] = React.useState("");

  const bulkImport = useBulkImportQuestions();

  const handleFile = async (file: File) => {
    setFileName(file.name);
    const text = await file.text();
    setRawPreview(text.slice(0, 1000));

    const isCsv = file.name.toLowerCase().endsWith(".csv");
    const result = isCsv ? parseCsvToItems(text) : parseJsonToItems(text);
    setItems(result.items);
    setErrors(result.errors);
  };

  const handleImport = async () => {
    if (!items.length) {
      toast({
        title: "No items to import",
        description: "Upload a valid JSON or CSV file first.",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await bulkImport.mutateAsync(items);
      toast({
        title: "Import complete",
        description: `Imported ${result.count} questions.`,
      });
      setItems([]);
      setErrors([]);
      setFileName("");
      setRawPreview("");
    } catch (err) {
      toast({
        title: "Import failed",
        description:
          err && typeof err === "object" && "message" in err
            ? String(err.message)
            : "Unable to import questions.",
        variant: "destructive",
      });
    }
  };

  return (
    <RequirePerm perm="questions.crud">
      <div className="space-y-6">
        <PageHeader
          title="Bulk Import Questions"
          description="Upload a JSON or CSV file to import questions in bulk."
        />

        <FormField label="Upload File" description="Accepts .json or .csv files.">
          <Input
            type="file"
            accept=".json,.csv"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) {
                handleFile(file).catch(() => {
                  setErrors([{ row: 0, message: "Unable to read file." }]);
                });
              }
            }}
          />
          {fileName ? (
            <p className="text-xs text-muted-foreground">Selected: {fileName}</p>
          ) : null}
        </FormField>

        {errors.length ? (
          <ErrorState
            title="Parsing errors"
            description={`Fix ${errors.length} row issue(s) before importing.`}
          />
        ) : null}

        {errors.length ? (
          <div className="rounded-2xl border border-border bg-card p-4 text-sm text-foreground">
            <ul className="list-disc space-y-1 pl-5">
              {errors.slice(0, 10).map((error) => (
                <li key={`${error.row}-${error.message}`}>
                  Row {error.row}: {error.message}
                </li>
              ))}
            </ul>
            {errors.length > 10 ? (
              <p className="mt-2 text-xs text-muted-foreground">
                Showing first 10 errors.
              </p>
            ) : null}
          </div>
        ) : null}

        <div className="rounded-2xl border border-border bg-card p-4 text-sm">
          <p className="font-medium">Parsed items</p>
          <p className="text-xs text-muted-foreground">
            {items.length} question(s) ready to import.
          </p>
        </div>

        <FormTextarea
          label="File Preview"
          description="First 1000 characters of the uploaded file."
          value={rawPreview}
          onChange={() => undefined}
          readOnly
        />

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            disabled={!items.length || bulkImport.isPending}
            onClick={handleImport}
          >
            {bulkImport.isPending ? "Importing..." : "Import Questions"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              setItems([]);
              setErrors([]);
              setFileName("");
              setRawPreview("");
            }}
          >
            Clear
          </Button>
        </div>
      </div>
    </RequirePerm>
  );
}
