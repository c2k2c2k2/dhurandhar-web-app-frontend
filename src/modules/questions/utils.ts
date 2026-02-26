"use client";

import type { QuestionContentBlock } from "./types";

export const MATH_INLINE_ATTR = "data-question-math-inline";
export const MATH_BLOCK_ATTR = "data-question-math-block";
export type QuestionContentLanguage = "en" | "mr" | "both";
const CONTENT_LANGUAGES = ["en", "mr"] as const;

const ENTITY_MAP: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
};
const IGNORED_TEXT_KEYS = new Set([
  "imageAssetId",
  "assetId",
  "format",
  "languageMode",
  "primaryLanguage",
  "translations",
]);

function normalizeLanguage(language: string | undefined): "en" | "mr" {
  if (language === "mr") return "mr";
  return "en";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function getTranslations(value: Record<string, unknown>): Record<string, unknown> | null {
  if (!isRecord(value.translations)) {
    return null;
  }
  return value.translations;
}

function hasMeaningfulValue(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return Boolean(value.trim());
  if (typeof value === "number" || typeof value === "boolean") return true;
  if (Array.isArray(value)) return value.some((item) => hasMeaningfulValue(item));
  if (isRecord(value)) {
    return Object.values(value).some((entry) => hasMeaningfulValue(entry));
  }
  return false;
}

function hasTranslationContainer(value: unknown): boolean {
  if (!isRecord(value)) return false;
  if (CONTENT_LANGUAGES.some((key) => key in value)) {
    return true;
  }
  const translations = getTranslations(value);
  if (!translations) return false;
  return CONTENT_LANGUAGES.some((key) => key in translations);
}

function resolveLocalizedValue(
  value: Record<string, unknown>,
  language: "en" | "mr",
  allowFallback = true
): unknown | undefined {
  if (value[language] !== undefined) {
    return value[language];
  }

  const translations = getTranslations(value);
  if (translations) {
    if (translations[language] !== undefined) {
      return translations[language];
    }
    if (!allowFallback) {
      return undefined;
    }
    if (translations.en !== undefined) {
      return translations.en;
    }
    if (translations.mr !== undefined) {
      return translations.mr;
    }
    const first = Object.values(translations).find((entry) => entry !== undefined);
    if (first !== undefined) {
      return first;
    }
  }

  return undefined;
}

export function resolveLocalizedContent(
  value: unknown,
  language: string | undefined = "en"
): unknown {
  if (!isRecord(value) || language === "both") {
    return value;
  }
  const localized = resolveLocalizedValue(value, normalizeLanguage(language));
  return localized === undefined ? value : localized;
}

export function resolveLocalizedContentStrict(
  value: unknown,
  language: "en" | "mr"
): unknown | undefined {
  if (!isRecord(value)) {
    return undefined;
  }
  return resolveLocalizedValue(value, language, false);
}

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
    if (language === "both" && hasTranslationContainer(value)) {
      const english = extractText(resolveLocalizedContent(value, "en"), "en");
      const marathi = extractText(resolveLocalizedContent(value, "mr"), "mr");
      if (english && marathi && english !== marathi) {
        return `${english} / ${marathi}`.trim();
      }
      return (english || marathi).trim();
    }

    const localizedContent = resolveLocalizedContent(value, language);
    if (localizedContent !== value) {
      return extractText(localizedContent, language);
    }

    const obj = value as Record<string, unknown>;
    if (typeof obj.html === "string") {
      const htmlText = extractTextFromHtml(obj.html);
      if (htmlText) return htmlText;
    }
    const localizedString = extractLocalizedString(obj, language);
    if (localizedString) {
      return localizedString;
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
    if (language === "both") {
      return extractHtml(resolveLocalizedContent(value, "en"), "en");
    }

    const localizedContent = resolveLocalizedContent(value, language);
    if (localizedContent !== value) {
      return extractHtml(localizedContent, language);
    }

    const obj = value as Record<string, unknown>;
    if (typeof obj.html === "string" && hasMeaningfulHtml(obj.html)) {
      return obj.html;
    }
    const localizedString = extractLocalizedString(obj, language);
    if (localizedString) {
      return convertPlainTextToHtml(localizedString);
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

export function extractImageAssetId(
  value: unknown,
  language = "en"
): string | undefined {
  if (!value || typeof value !== "object") return undefined;

  if (language !== "both") {
    const localized = resolveLocalizedContent(value, language);
    if (localized !== value) {
      return extractImageAssetId(localized, language);
    }
  }

  const obj = value as Record<string, unknown>;
  const direct =
    (typeof obj.imageAssetId === "string" && obj.imageAssetId) ||
    (typeof obj.assetId === "string" && obj.assetId);
  if (direct) return direct;
  if (Array.isArray(obj.blocks)) {
    for (const block of obj.blocks) {
      const candidate = extractImageAssetId(block, language);
      if (candidate) return candidate;
    }
  }
  return undefined;
}

export function extractLocalizedContentBlock(
  value: unknown,
  language: "en" | "mr",
  fallback = true
): {
  text: string;
  html: string;
  imageAssetId?: string;
} {
  const localized = fallback
    ? resolveLocalizedContent(value, language)
    : resolveLocalizedContentStrict(value, language) ?? {};
  return {
    text: extractText(localized, language),
    html: extractHtml(localized, language),
    imageAssetId: extractImageAssetId(localized, language),
  };
}

export function hasLanguageVariant(
  value: unknown,
  language: "en" | "mr"
): boolean {
  if (value === null || value === undefined) return false;

  if (!isRecord(value) && !Array.isArray(value)) {
    return language === "en" && hasMeaningfulValue(value);
  }

  if (Array.isArray(value)) {
    return value.some((item) => hasLanguageVariant(item, language));
  }

  const localized = resolveLocalizedValue(value, language, false);
  if (localized !== undefined) {
    return hasMeaningfulValue(localized);
  }

  if (language === "en") {
    return hasMeaningfulValue(value);
  }

  return false;
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

export function normalizeOptions(value: unknown, language = "en", fallback = true) {
  const extractOptionValue = (option: unknown) => {
    if (language === "both") {
      return option;
    }
    if (!fallback) {
      const strict = resolveLocalizedContentStrict(
        option,
        normalizeLanguage(language)
      );
      return strict ?? {};
    }
    return option;
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
    text: extractText(extractOptionValue(option), language),
    html: extractHtml(extractOptionValue(option), language) || undefined,
    imageAssetId: extractImageAssetId(extractOptionValue(option), language),
  }));

  while (mapped.length < 4) {
    mapped.push({
      text: "",
      html: undefined,
      imageAssetId: undefined,
    });
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
