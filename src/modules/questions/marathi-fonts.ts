"use client";

export type MarathiEncodedFontKey = "shree-dev" | "surekh";

export const DEFAULT_MARATHI_ENCODED_FONT: MarathiEncodedFontKey = "shree-dev";

export const MARATHI_FONT_LABELS: Record<MarathiEncodedFontKey, string> = {
  "shree-dev": "Shree-Dev",
  surekh: "Surekh",
};

export const MARATHI_FONT_CLASSES: Record<MarathiEncodedFontKey, string> = {
  "shree-dev": "font-marathi-encoded font-marathi-shree-dev font-legacy-marathi",
  surekh: "font-marathi-encoded font-marathi-surekh font-marathi-sulekha",
};

const FONT_HINTS: Record<MarathiEncodedFontKey, readonly string[]> = {
  "shree-dev": [
    "shree dev",
    "shree-dev",
    "s0708892",
    "shreelipi",
    "font-legacy-marathi",
    "font-marathi-shree-dev",
    'data-question-font="shree-dev"',
  ],
  surekh: [
    "surekh",
    "sulekha",
    "ttsurekh",
    "dvbwsr3",
    "dvbw-ttsurekhen",
    "dvbwttsurekhen",
    "web-surekh-en",
    "isfoc-devanagari-bilingual-web-surekh-en-normal",
    "font-marathi-surekh",
    "font-marathi-sulekha",
    'data-question-font="surekh"',
    'data-question-font="sulekha"',
  ],
};

const DEVANAGARI_CHAR_PATTERN = /[\u0900-\u097F]/;
const SUREKH_GLYPH_PATTERN =
  /[\u00A1-\u00FF\u0152\u0153\u0160\u0161\u0178\u017D\u017E\u02C6\u02DC\u2013-\u2022\u2026\u2030\u2039\u203A\u20AC]/g;
const LEGACY_GLYPH_PATTERN =
  /[À-ÿ†‡•–—…‰‹›€™„‚ƒˆ˜¯±÷×°¼½¾¿¢£¤¥¦§©®µ¶¸¹ºª«»¬]/g;

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function getMarathiFontKeyFromHint(value: string): MarathiEncodedFontKey | null {
  const normalized = value.toLowerCase();

  for (const [fontKey, hints] of Object.entries(FONT_HINTS) as Array<
    [MarathiEncodedFontKey, readonly string[]]
  >) {
    if (hints.some((hint) => normalized.includes(hint))) {
      return fontKey;
    }
  }

  return null;
}

export function getMarathiFontKeyFromElement(
  element: HTMLElement
): MarathiEncodedFontKey | null {
  const explicitFont = element.getAttribute("data-question-font");
  if (explicitFont === "shree-dev") {
    return explicitFont;
  }
  if (explicitFont === "surekh" || explicitFont === "sulekha") {
    return "surekh";
  }

  const classes = element.className.toLowerCase().split(/\s+/);
  if (classes.includes("font-marathi-surekh") || classes.includes("font-marathi-sulekha")) {
    return "surekh";
  }
  if (
    classes.includes("font-marathi-shree-dev") ||
    classes.includes("font-legacy-marathi")
  ) {
    return "shree-dev";
  }

  const styleValue = `${element.getAttribute("style") || ""} ${element.style.fontFamily || ""}`;
  return getMarathiFontKeyFromHint(styleValue);
}

export function hasEncodedMarathiMarker(value: unknown): boolean {
  return getMarathiFontKeyFromValue(value) !== null;
}

export function getLikelyLegacyMarathiFontKey(
  value: string | null | undefined
): MarathiEncodedFontKey | null {
  const text = value?.trim() ?? "";
  if (!text) return null;

  const hintedFont = getMarathiFontKeyFromHint(text);
  if (hintedFont) {
    return hintedFont;
  }

  if (DEVANAGARI_CHAR_PATTERN.test(text)) {
    return null;
  }

  const surekhMatches = text.match(SUREKH_GLYPH_PATTERN);
  if (
    surekhMatches &&
    surekhMatches.length >= Math.max(3, Math.floor(text.length * 0.12))
  ) {
    return "surekh";
  }

  const legacyMatches = text.match(LEGACY_GLYPH_PATTERN);
  if (!legacyMatches) {
    return null;
  }

  const ratio = legacyMatches.length / text.length;
  return legacyMatches.length >= 3 && ratio >= 0.08
    ? DEFAULT_MARATHI_ENCODED_FONT
    : null;
}

function findMarathiFontKey(
  value: unknown,
  detector: (input: string) => MarathiEncodedFontKey | null
): MarathiEncodedFontKey | null {
  if (!value) return null;

  if (typeof value === "string") {
    return detector(value);
  }

  if (Array.isArray(value)) {
    for (const entry of value) {
      const fontKey = findMarathiFontKey(entry, detector);
      if (fontKey) {
        return fontKey;
      }
    }
    return null;
  }

  if (!isRecord(value)) {
    return null;
  }

  for (const entry of Object.values(value)) {
    const fontKey = findMarathiFontKey(entry, detector);
    if (fontKey) {
      return fontKey;
    }
  }

  return null;
}

export function getMarathiFontKeyFromValue(
  value: unknown
): MarathiEncodedFontKey | null {
  return (
    findMarathiFontKey(value, getMarathiFontKeyFromHint) ??
    findMarathiFontKey(value, getLikelyLegacyMarathiFontKey)
  );
}

export function isLikelyLegacyMarathiEncodedText(value: string | null | undefined): boolean {
  return getLikelyLegacyMarathiFontKey(value) !== null;
}
