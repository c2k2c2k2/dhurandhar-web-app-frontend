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
  const text = extractText(content, resolvedLanguage);
  const html = extractHtml(content, resolvedLanguage);
  const imageAssetId = extractImageAssetId(content);
  const imageUrl = imageAssetId ? getAssetUrl(imageAssetId) : "";

  if (!text && !html && !imageUrl) {
    return null;
  }

  return (
    <div className={cn("space-y-3", className)}>
      <RichTextRenderer html={html} fallbackText={text} />
      {imageUrl ? (
        <div className={cn("overflow-hidden rounded-2xl border border-border bg-muted/40", imageClassName)}>
          <img
            src={imageUrl}
            alt="Question media"
            className="w-full object-contain"
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
}
