"use client";

import type { QuestionContentBlock } from "./types";

export function extractText(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  if (Array.isArray(value)) {
    return value.map(extractText).join(" ").trim();
  }
  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;
    if (typeof obj.text === "string") {
      return obj.text;
    }
    if (Array.isArray(obj.blocks)) {
      return obj.blocks.map(extractText).join(" ").trim();
    }
    return Object.values(obj).map(extractText).join(" ").trim();
  }
  return "";
}

export function extractImageAssetId(value: unknown): string | undefined {
  if (!value || typeof value !== "object") return undefined;
  const obj = value as Record<string, unknown>;
  const direct =
    (typeof obj.imageAssetId === "string" && obj.imageAssetId) ||
    (typeof obj.assetId === "string" && obj.assetId);
  if (direct) return direct;
  if (Array.isArray(obj.blocks)) {
    for (const block of obj.blocks) {
      const candidate = extractImageAssetId(block);
      if (candidate) return candidate;
    }
  }
  return undefined;
}

export function buildContent(
  text?: string,
  imageAssetId?: string
): QuestionContentBlock | undefined {
  const trimmed = text?.trim();
  if (!trimmed && !imageAssetId) return undefined;
  const content: QuestionContentBlock = {};
  if (trimmed) content.text = trimmed;
  if (imageAssetId) content.imageAssetId = imageAssetId;
  return content;
}

export function normalizeOptions(value: unknown) {
  let rawOptions: unknown[] = [];
  if (Array.isArray(value)) {
    rawOptions = value;
  } else if (value && typeof value === "object") {
    const obj = value as Record<string, unknown>;
    if (Array.isArray(obj.options)) {
      rawOptions = obj.options;
    }
  }

  const mapped = rawOptions.map((option) => ({
    text: extractText(option),
    imageAssetId: extractImageAssetId(option),
  }));

  while (mapped.length < 4) {
    mapped.push({ text: "", imageAssetId: undefined });
  }

  return mapped.slice(0, 4);
}

export function truncateText(text: string, maxLength = 120) {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (!normalized) return "";
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, maxLength).trim()}…`;
}
