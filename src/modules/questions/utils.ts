"use client";

import type { QuestionContentBlock } from "./types";

function extractLocalizedString(
  value: Record<string, unknown>,
  language: string,
): string | null {
  const byLanguage = value[language];
  if (typeof byLanguage === "string") {
    return byLanguage;
  }

  const translations = value.translations;
  if (translations && typeof translations === "object") {
    const translated = (translations as Record<string, unknown>)[language];
    if (typeof translated === "string") {
      return translated;
    }
    const fallbackEn = (translations as Record<string, unknown>).en;
    if (typeof fallbackEn === "string") {
      return fallbackEn;
    }
  }

  const text = value.text;
  if (text && typeof text === "object") {
    const translated = (text as Record<string, unknown>)[language];
    if (typeof translated === "string") {
      return translated;
    }
    const fallbackEn = (text as Record<string, unknown>).en;
    if (typeof fallbackEn === "string") {
      return fallbackEn;
    }
  }

  return null;
}

export function extractText(value: unknown, language = "en"): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  if (Array.isArray(value)) {
    return value.map((item) => extractText(item, language)).join(" ").trim();
  }
  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;
    const localized = extractLocalizedString(obj, language);
    if (localized) {
      return localized;
    }
    if (typeof obj.text === "string") {
      return obj.text;
    }
    if (Array.isArray(obj.blocks)) {
      return obj.blocks.map((item) => extractText(item, language)).join(" ").trim();
    }
    return Object.values(obj)
      .map((item) => extractText(item, language))
      .join(" ")
      .trim();
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

export function normalizeOptions(value: unknown, language = "en") {
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
    text: extractText(option, language),
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
