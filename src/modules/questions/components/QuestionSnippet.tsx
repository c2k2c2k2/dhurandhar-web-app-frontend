"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  getLikelyLegacyMarathiFontKey,
  getMarathiFontKeyFromValue,
  MARATHI_FONT_CLASSES,
} from "@/modules/questions/marathi-fonts";
import { extractText, truncateText } from "@/modules/questions/utils";

export function QuestionSnippet({
  content,
  maxLength = 140,
  className,
  fallback = "Question",
}: {
  content: unknown;
  maxLength?: number;
  className?: string;
  fallback?: string;
}) {
  const text = React.useMemo(
    () => truncateText(extractText(content), maxLength),
    [content, maxLength],
  );
  const fontKey = React.useMemo(
    () => getMarathiFontKeyFromValue(content) || getLikelyLegacyMarathiFontKey(text),
    [content, text],
  );

  return (
    <p
      className={cn(
        "text-sm leading-relaxed text-foreground",
        fontKey && MARATHI_FONT_CLASSES[fontKey],
        className,
      )}
    >
      {text || fallback}
    </p>
  );
}
