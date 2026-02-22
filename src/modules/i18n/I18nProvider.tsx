"use client";

import * as React from "react";
import {
  AppLanguage,
  DEFAULT_LANGUAGES,
  LANGUAGE_LABELS,
  TRANSLATIONS,
} from "./translations";

type LanguageConfig = {
  enabledLanguages: AppLanguage[];
  defaultLanguage: AppLanguage;
};

type I18nContextValue = {
  language: AppLanguage;
  availableLanguages: AppLanguage[];
  defaultLanguage: AppLanguage;
  setLanguage: (language: AppLanguage) => void;
  t: (key: string, fallback?: string) => string;
};

const STORAGE_KEY = "dhurandhar_language";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

const I18nContext = React.createContext<I18nContextValue | undefined>(
  undefined,
);

function isLanguage(value: unknown): value is AppLanguage {
  return value === "en" || value === "hi" || value === "mr";
}

function normalizeLanguageConfig(payload: unknown): LanguageConfig {
  const fallback: LanguageConfig = {
    enabledLanguages: DEFAULT_LANGUAGES,
    defaultLanguage: "en",
  };

  if (!payload || typeof payload !== "object") {
    return fallback;
  }

  const root = payload as Record<string, unknown>;
  const configs = Array.isArray(root.configs) ? root.configs : [];
  const config = configs.find((item) => {
    if (!item || typeof item !== "object") return false;
    return (item as Record<string, unknown>).key === "app.languages";
  }) as Record<string, unknown> | undefined;

  const configJson =
    config && typeof config.configJson === "object" && config.configJson
      ? (config.configJson as Record<string, unknown>)
      : null;

  if (!configJson) {
    return fallback;
  }

  const rawEnabled =
    (Array.isArray(configJson.enabledLanguages)
      ? configJson.enabledLanguages
      : Array.isArray(configJson.languages)
        ? configJson.languages
        : []) ?? [];

  const enabled = rawEnabled.filter(isLanguage);
  const deduped = Array.from(new Set(enabled));
  const enabledLanguages = deduped.length ? deduped : DEFAULT_LANGUAGES;

  const defaultLanguage = isLanguage(configJson.defaultLanguage)
    ? configJson.defaultLanguage
    : enabledLanguages.includes("en")
      ? "en"
      : enabledLanguages[0];

  return {
    enabledLanguages,
    defaultLanguage,
  };
}

function resolveUrl(path: string) {
  if (!API_BASE_URL) {
    return path;
  }
  return `${API_BASE_URL}${path}`;
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = React.useState<LanguageConfig>({
    enabledLanguages: DEFAULT_LANGUAGES,
    defaultLanguage: "en",
  });

  const [language, setLanguageState] = React.useState<AppLanguage>("en");

  React.useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (isLanguage(stored)) {
      setLanguageState(stored);
    }
  }, []);

  React.useEffect(() => {
    let active = true;

    const loadLanguageConfig = async () => {
      try {
        const response = await fetch(resolveUrl("/cms/student?keys=app.languages"), {
          method: "GET",
          headers: { Accept: "application/json" },
          cache: "no-store",
        });
        if (!response.ok) {
          return;
        }
        const payload = (await response.json()) as unknown;
        if (!active) return;
        setConfig(normalizeLanguageConfig(payload));
      } catch {
        // keep fallback config
      }
    };

    void loadLanguageConfig();

    return () => {
      active = false;
    };
  }, []);

  React.useEffect(() => {
    if (!config.enabledLanguages.includes(language)) {
      setLanguageState(config.defaultLanguage);
    }
  }, [config, language]);

  const setLanguage = React.useCallback(
    (nextLanguage: AppLanguage) => {
      if (!config.enabledLanguages.includes(nextLanguage)) {
        return;
      }
      setLanguageState(nextLanguage);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(STORAGE_KEY, nextLanguage);
      }
    },
    [config.enabledLanguages],
  );

  const t = React.useCallback(
    (key: string, fallback?: string) => {
      const current = TRANSLATIONS[language]?.[key];
      if (current) return current;
      const english = TRANSLATIONS.en?.[key];
      if (english) return english;
      return fallback ?? key;
    },
    [language],
  );

  const value = React.useMemo<I18nContextValue>(
    () => ({
      language,
      availableLanguages: config.enabledLanguages,
      defaultLanguage: config.defaultLanguage,
      setLanguage,
      t,
    }),
    [config.defaultLanguage, config.enabledLanguages, language, setLanguage, t],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = React.useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within I18nProvider");
  }
  return context;
}

export { LANGUAGE_LABELS };
