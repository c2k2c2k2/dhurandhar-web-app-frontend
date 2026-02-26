"use client";

import * as React from "react";
import { useI18n } from "@/modules/i18n";

export type QuestionLanguageMode = "en" | "mr" | "both";

type QuestionLanguageContextValue = {
  mode: QuestionLanguageMode;
  setMode: (mode: QuestionLanguageMode) => void;
};

const STORAGE_KEY = "dhurandhar_question_language_mode";

const QuestionLanguageContext = React.createContext<QuestionLanguageContextValue | undefined>(
  undefined
);

function toQuestionLanguage(value: unknown): QuestionLanguageMode | null {
  if (value === "en" || value === "mr" || value === "both") {
    return value;
  }
  return null;
}

function mapI18nToQuestionLanguage(language: string): QuestionLanguageMode {
  if (language === "mr") return "mr";
  return "en";
}

export function QuestionLanguageProvider({ children }: { children: React.ReactNode }) {
  const { language } = useI18n();
  const [mode, setModeState] = React.useState<QuestionLanguageMode>(
    mapI18nToQuestionLanguage(language)
  );

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = toQuestionLanguage(window.localStorage.getItem(STORAGE_KEY));
    if (stored) {
      setModeState(stored);
      return;
    }
    setModeState(mapI18nToQuestionLanguage(language));
  }, [language]);

  const setMode = React.useCallback((nextMode: QuestionLanguageMode) => {
    setModeState(nextMode);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, nextMode);
    }
  }, []);

  const value = React.useMemo(
    () => ({
      mode,
      setMode,
    }),
    [mode, setMode]
  );

  return (
    <QuestionLanguageContext.Provider value={value}>
      {children}
    </QuestionLanguageContext.Provider>
  );
}

export function useQuestionLanguage() {
  const context = React.useContext(QuestionLanguageContext);
  if (!context) {
    throw new Error("useQuestionLanguage must be used within QuestionLanguageProvider");
  }
  return context;
}
