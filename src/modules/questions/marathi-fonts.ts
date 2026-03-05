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
  if (!value) return false;

  if (typeof value === "string") {
    return getMarathiFontKeyFromHint(value) !== null;
  }

  if (Array.isArray(value)) {
    return value.some((entry) => hasEncodedMarathiMarker(entry));
  }

  if (!isRecord(value)) {
    return false;
  }

  return Object.values(value).some((entry) => hasEncodedMarathiMarker(entry));
}

export function isLikelyLegacyMarathiEncodedText(value: string | null | undefined): boolean {
  const text = value?.trim() ?? "";
  if (!text) return false;
  if (DEVANAGARI_CHAR_PATTERN.test(text)) return false;

  const matches = text.match(LEGACY_GLYPH_PATTERN);
  if (!matches) return false;

  const ratio = matches.length / text.length;
  return matches.length >= 3 && ratio >= 0.08;
}
