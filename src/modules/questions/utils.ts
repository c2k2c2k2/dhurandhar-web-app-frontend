"use client";

import type { QuestionContentBlock } from "./types";

export const MATH_INLINE_ATTR = "data-question-math-inline";
export const MATH_BLOCK_ATTR = "data-question-math-block";

const ENTITY_MAP: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
};
const IGNORED_TEXT_KEYS = new Set(["imageAssetId", "assetId", "format"]);

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

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function decodeHtmlEntities(value: string): string {
  if (!value) return "";
  return value.replace(
    /&(#\d+|#x[0-9a-fA-F]+|[a-zA-Z]+);/g,
    (match, token: string) => {
      if (token.startsWith("#x")) {
        const code = Number.parseInt(token.slice(2), 16);
        return Number.isNaN(code) ? match : String.fromCodePoint(code);
      }
      if (token.startsWith("#")) {
        const code = Number.parseInt(token.slice(1), 10);
        return Number.isNaN(code) ? match : String.fromCodePoint(code);
      }
      return ENTITY_MAP[token] ?? match;
    },
  );
}

export function extractTextFromHtml(value: string): string {
  if (!value) return "";
  const withMathTokens = value
    .replace(
      /<(span|div)[^>]*\sdata-question-math-inline=(["'])(.*?)\2[^>]*>[\s\S]*?<\/\1>/gi,
      (_, _tag, _quote, latex: string) => ` ${decodeHtmlEntities(latex)} `,
    )
    .replace(
      /<(span|div)[^>]*\sdata-question-math-block=(["'])(.*?)\2[^>]*>[\s\S]*?<\/\1>/gi,
      (_, _tag, _quote, latex: string) => ` ${decodeHtmlEntities(latex)} `,
    );

  const withoutTags = withMathTokens
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ");

  return decodeHtmlEntities(withoutTags).replace(/\s+/g, " ").trim();
}

export function hasMeaningfulHtml(value: string | null | undefined): boolean {
  if (!value) return false;
  const normalized = value
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .trim();
  return decodeHtmlEntities(normalized).length > 0;
}

export function convertPlainTextToHtml(value: string | null | undefined): string {
  if (!value) return "";
  const normalized = value.replace(/\r/g, "").trim();
  if (!normalized) return "";
  const source = normalized.includes("&lt;") ? decodeHtmlEntities(normalized) : normalized;
  const placeholders: Array<{ token: string; html: string }> = [];
  let textWithTokens = source;

  textWithTokens = textWithTokens.replace(
    /<(span|div)[^>]*\sdata-question-math-inline=(["'])(.*?)\2[^>]*>[\s\S]*?<\/\1>/gi,
    (_match, _tag, _quote, latex: string) => {
      const token = `__QMATH_${placeholders.length}__`;
      placeholders.push({
        token,
        html: buildMathPlaceholderHtml(decodeHtmlEntities(latex), false),
      });
      return token;
    }
  );

  textWithTokens = textWithTokens.replace(
    /<(span|div)[^>]*\sdata-question-math-block=(["'])(.*?)\2[^>]*>[\s\S]*?<\/\1>/gi,
    (_match, _tag, _quote, latex: string) => {
      const token = `__QMATH_${placeholders.length}__`;
      placeholders.push({
        token,
        html: buildMathPlaceholderHtml(decodeHtmlEntities(latex), true),
      });
      return token;
    }
  );

  const htmlWithTokens = textWithTokens
    .split(/\n{2,}/)
    .map((paragraph) =>
      `<p>${paragraph
        .split("\n")
        .map((line) => escapeHtml(line))
        .join("<br />")}</p>`,
    )
    .join("");

  return placeholders.reduce(
    (result, placeholder) => result.replaceAll(placeholder.token, placeholder.html),
    htmlWithTokens
  );
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
    if (typeof obj.html === "string") {
      const htmlText = extractTextFromHtml(obj.html);
      if (htmlText) return htmlText;
    }
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
    return Object.entries(obj)
      .filter(([key]) => !IGNORED_TEXT_KEYS.has(key))
      .map(([, item]) => extractText(item, language))
      .join(" ")
      .trim();
  }
  return "";
}

export function extractHtml(value: unknown, language = "en"): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return convertPlainTextToHtml(String(value));
  }
  if (Array.isArray(value)) {
    return value.map((item) => extractHtml(item, language)).join("");
  }
  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;
    if (typeof obj.html === "string" && hasMeaningfulHtml(obj.html)) {
      return obj.html;
    }
    const localized = extractLocalizedString(obj, language);
    if (localized) {
      return convertPlainTextToHtml(localized);
    }
    if (typeof obj.text === "string") {
      return convertPlainTextToHtml(obj.text);
    }
    if (Array.isArray(obj.blocks)) {
      return obj.blocks.map((item) => extractHtml(item, language)).join("");
    }
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
  imageAssetId?: string,
  html?: string
): QuestionContentBlock | undefined {
  const trimmedHtml = html?.trim();
  const normalizedHtml = trimmedHtml && hasMeaningfulHtml(trimmedHtml) ? trimmedHtml : undefined;
  const trimmed = text?.trim() || (normalizedHtml ? extractTextFromHtml(normalizedHtml) : "");
  if (!trimmed && !imageAssetId && !normalizedHtml) return undefined;
  const content: QuestionContentBlock = {};
  if (trimmed) content.text = trimmed;
  if (normalizedHtml) {
    content.html = normalizedHtml;
    content.format = "RICH_TEXT_V1";
  }
  if (imageAssetId) content.imageAssetId = imageAssetId;
  return content;
}

export function normalizeOptions(value: unknown, language = "en") {
  const extractOptionText = (option: unknown): string => {
    if (option === null || option === undefined) return "";
    if (
      typeof option === "string" ||
      typeof option === "number" ||
      typeof option === "boolean"
    ) {
      return String(option);
    }
    if (Array.isArray(option)) {
      return option
        .map((item) => extractOptionText(item))
        .join(" ")
        .trim();
    }
    if (typeof option === "object") {
      const obj = option as Record<string, unknown>;
      if (typeof obj.html === "string") {
        const text = extractTextFromHtml(obj.html);
        if (text) return text;
      }
      const localized = extractLocalizedString(obj, language);
      if (localized) {
        return localized;
      }
      if (typeof obj.text === "string") {
        return obj.text;
      }
      if (Array.isArray(obj.blocks)) {
        return obj.blocks
          .map((item) => extractOptionText(item))
          .join(" ")
          .trim();
      }
    }
    return "";
  };

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
    text: extractOptionText(option),
    html: extractHtml(option, language) || undefined,
    imageAssetId: extractImageAssetId(option),
  }));

  while (mapped.length < 4) {
    mapped.push({ text: "", html: undefined, imageAssetId: undefined });
  }

  return mapped.slice(0, 4);
}

export function truncateText(text: string, maxLength = 120) {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (!normalized) return "";
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, maxLength).trim()}…`;
}

export function buildMathPlaceholderHtml(
  latex: string,
  displayMode: boolean,
): string {
  const trimmed = latex.trim();
  if (!trimmed) return "";
  const escaped = escapeHtml(trimmed);
  return displayMode
    ? `<div ${MATH_BLOCK_ATTR}="${escaped}"></div>`
    : `<span ${MATH_INLINE_ATTR}="${escaped}"></span>`;
}
