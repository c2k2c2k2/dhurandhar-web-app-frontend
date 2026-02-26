"use client";

import * as React from "react";
import { Languages } from "lucide-react";
import { useQuestionLanguage, type QuestionLanguageMode } from "./QuestionLanguageProvider";

const MODES: Array<{ value: QuestionLanguageMode; label: string }> = [
  { value: "en", label: "English" },
  { value: "mr", label: "Marathi" },
  { value: "both", label: "Both" },
];

export function QuestionLanguageSwitcher() {
  const { mode, setMode } = useQuestionLanguage();

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-border bg-background/80 px-3 py-2">
      <div className="flex items-center gap-1 text-xs uppercase tracking-[0.18em] text-muted-foreground">
        <Languages className="h-3.5 w-3.5" />
        Question language
      </div>
      <div className="flex flex-wrap gap-1">
        {MODES.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => setMode(item.value)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition ${
              mode === item.value
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}
