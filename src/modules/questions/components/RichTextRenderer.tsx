"use client";

import * as React from "react";
import katex from "katex";
import { Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { getAssetUrl } from "@/lib/api/assets";
import {
  decodeHtmlEntities,
  extractHtml,
  extractImageAssetId,
  extractText,
  MATH_BLOCK_ATTR,
  MATH_INLINE_ATTR,
  resolveLocalizedContentStrict,
} from "../utils";

function normalizeLatex(value: string): string {
  const decoded = decodeHtmlEntities(value || "").trim();
  if (!decoded) return "";
  if (decoded.startsWith('"') && decoded.endsWith('"')) {
    try {
      const parsed = JSON.parse(decoded);
      if (typeof parsed === "string") {
        return parsed.trim();
      }
    } catch {
      // keep fallback below
    }
  }
  if (
    (decoded.startsWith('"') && decoded.endsWith('"')) ||
    (decoded.startsWith("'") && decoded.endsWith("'"))
  ) {
    return decoded.slice(1, -1).trim();
  }
  return decoded;
}

function renderMathInHtml(html: string): string {
  if (!html.trim() || typeof window === "undefined") {
    return html;
  }

  try {
    const parser = new DOMParser();
    const document = parser.parseFromString(`<div id="root">${html}</div>`, "text/html");
    const root = document.getElementById("root");
    if (!root) return html;

    root.querySelectorAll(`[${MATH_INLINE_ATTR}]`).forEach((node) => {
      const latex = normalizeLatex(node.getAttribute(MATH_INLINE_ATTR) || "");
      node.innerHTML = katex.renderToString(latex, {
        displayMode: false,
        throwOnError: false,
        strict: "ignore",
      });
      node.removeAttribute(MATH_INLINE_ATTR);
    });

    root.querySelectorAll(`[${MATH_BLOCK_ATTR}]`).forEach((node) => {
      const latex = normalizeLatex(node.getAttribute(MATH_BLOCK_ATTR) || "");
      node.innerHTML = katex.renderToString(latex, {
        displayMode: true,
        throwOnError: false,
        strict: "ignore",
      });
      node.removeAttribute(MATH_BLOCK_ATTR);
    });

    return root.innerHTML;
  } catch {
    return html;
  }
}

export function RichTextRenderer({
  html,
  fallbackText,
  className,
}: {
  html?: string | null;
  fallbackText?: string;
  className?: string;
}) {
  const renderedHtml = React.useMemo(
    () => (html ? renderMathInHtml(html) : ""),
    [html],
  );

  if (renderedHtml) {
    return (
      <div
        className={cn("question-rich-content", className)}
        dangerouslySetInnerHTML={{ __html: renderedHtml }}
      />
    );
  }

  if (fallbackText) {
    return <p className={cn("text-sm leading-relaxed", className)}>{fallbackText}</p>;
  }

  return null;
}

export function QuestionRichContent({
  content,
  language,
  className,
  imageClassName,
}: {
  content?: unknown;
  language?: string;
  className?: string;
  imageClassName?: string;
}) {
  const resolvedLanguage = language || "en";

  const renderContentBlock = (
    block: unknown,
    blockLanguage: "en" | "mr",
    label?: string
  ) => {
    const text = extractText(block, blockLanguage);
    const html = extractHtml(block, blockLanguage);
    const imageAssetId = extractImageAssetId(block, blockLanguage);
    const imageUrl = imageAssetId ? getAssetUrl(imageAssetId) : "";

    if (!text && !html && !imageUrl) {
      return null;
    }

    const contentClassName = blockLanguage === "mr" ? "font-marathi-unicode" : undefined;

    return (
      <div className="space-y-2">
        {label ? (
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            {label}
          </p>
        ) : null}
        <RichTextRenderer html={html} fallbackText={text} className={contentClassName} />
        {imageUrl ? (
          <div
            className={cn(
              "overflow-hidden rounded-2xl border border-border bg-muted/30 p-2",
              imageClassName
            )}
          >
            <img
              src={imageUrl}
              alt="Question media"
              className="question-media mx-auto h-auto w-auto max-w-full object-contain"
              loading="lazy"
            />
          </div>
        ) : null}
        {!text && !html && imageUrl ? (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <ImageIcon className="h-4 w-4" />
            Media attached
          </div>
        ) : null}
      </div>
    );
  };

  if (resolvedLanguage === "both") {
    const english = resolveLocalizedContentStrict(content, "en");
    const marathi = resolveLocalizedContentStrict(content, "mr");

    if (!english && !marathi) {
      const fallback = renderContentBlock(content, "en");
      return fallback ? <div className={cn("space-y-3", className)}>{fallback}</div> : null;
    }

    const englishBlock = english ? renderContentBlock(english, "en", "English") : null;
    const marathiBlock = marathi ? renderContentBlock(marathi, "mr", "Marathi") : null;

    if (!englishBlock && !marathiBlock) {
      return null;
    }

    return (
      <div className={cn("space-y-4", className)}>
        {englishBlock}
        {marathiBlock}
      </div>
    );
  }

  const languageCode = resolvedLanguage === "mr" ? "mr" : "en";
  const block = renderContentBlock(content, languageCode);
  if (!block) {
    return null;
  }
  return <div className={cn("space-y-3", className)}>{block}</div>;
}
