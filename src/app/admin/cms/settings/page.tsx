"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { RequirePerm } from "@/lib/auth/guards";
import { CmsSubNav } from "@/modules/cms/components/CmsSubNav";
import {
  useConfigs,
  useCreateConfig,
  usePublishConfig,
} from "@/modules/cms/hooks";
import type { AppConfig } from "@/modules/cms/types";
import { FormSelect, FormTextarea } from "@/modules/shared/components/FormField";
import { PageHeader } from "@/modules/shared/components/PageHeader";
import { useToast } from "@/modules/shared/components/Toast";

const LANGUAGES = [
  { key: "en", label: "English" },
  { key: "hi", label: "Hindi" },
  { key: "mr", label: "Marathi" },
] as const;

type LanguageKey = (typeof LANGUAGES)[number]["key"];

function sortByVersionDesc(configs: AppConfig[]) {
  return [...configs].sort((a, b) => b.version - a.version);
}

function getLatest(configs: AppConfig[]) {
  return sortByVersionDesc(configs)[0] ?? null;
}

function getLatestPublished(configs: AppConfig[]) {
  return sortByVersionDesc(configs).find((item) => item.status === "PUBLISHED") ?? null;
}

function getConfigJson(config: AppConfig | null) {
  if (!config?.configJson || typeof config.configJson !== "object") {
    return {} as Record<string, unknown>;
  }
  return config.configJson as Record<string, unknown>;
}

export default function AdminCmsSettingsPage() {
  const { toast } = useToast();
  const createConfig = useCreateConfig();
  const publishConfig = usePublishConfig();

  const { data: languageConfigsData } = useConfigs({
    key: "app.languages",
    page: 1,
    pageSize: 50,
  });
  const { data: presetConfigsData } = useConfigs({
    key: "test.presets",
    page: 1,
    pageSize: 50,
  });

  const languageConfigs = languageConfigsData?.data ?? [];
  const presetConfigs = presetConfigsData?.data ?? [];

  const latestLanguage = getLatest(languageConfigs);
  const latestLanguagePublished = getLatestPublished(languageConfigs);
  const latestPreset = getLatest(presetConfigs);
  const latestPresetPublished = getLatestPublished(presetConfigs);

  const [enabledLanguages, setEnabledLanguages] = React.useState<LanguageKey[]>([
    "en",
    "hi",
    "mr",
  ]);
  const [defaultLanguage, setDefaultLanguage] = React.useState<LanguageKey>("en");
  const [presetText, setPresetText] = React.useState<string>("{\n  \"presets\": []\n}");

  React.useEffect(() => {
    const source = getConfigJson(latestLanguagePublished ?? latestLanguage);
    const rawEnabled = Array.isArray(source.enabledLanguages)
      ? source.enabledLanguages
      : Array.isArray(source.languages)
        ? source.languages
        : [];
    const nextEnabled = rawEnabled.filter((item): item is LanguageKey =>
      LANGUAGES.some((lang) => lang.key === item),
    );

    if (nextEnabled.length) {
      setEnabledLanguages(Array.from(new Set(nextEnabled)));
    }

    const rawDefault = source.defaultLanguage;
    if (typeof rawDefault === "string" && LANGUAGES.some((lang) => lang.key === rawDefault)) {
      setDefaultLanguage(rawDefault as LanguageKey);
    }
  }, [latestLanguage, latestLanguagePublished]);

  React.useEffect(() => {
    const source = getConfigJson(latestPresetPublished ?? latestPreset);
    if (Object.keys(source).length) {
      setPresetText(JSON.stringify(source, null, 2));
    }
  }, [latestPreset, latestPresetPublished]);

  const toggleLanguage = (key: LanguageKey) => {
    setEnabledLanguages((prev) => {
      if (prev.includes(key)) {
        if (prev.length === 1) {
          return prev;
        }
        const next = prev.filter((item) => item !== key);
        if (!next.includes(defaultLanguage)) {
          setDefaultLanguage(next[0]);
        }
        return next;
      }
      return [...prev, key];
    });
  };

  const saveLanguageDraft = async () => {
    try {
      const payload = {
        key: "app.languages",
        configJson: {
          enabledLanguages,
          defaultLanguage,
        },
      };
      await createConfig.mutateAsync(payload);
      toast({ title: "Language settings draft created" });
    } catch (err) {
      toast({
        title: "Save failed",
        description:
          err && typeof err === "object" && "message" in err
            ? String(err.message)
            : "Unable to save language settings.",
        variant: "destructive",
      });
    }
  };

  const savePresetDraft = async () => {
    try {
      const parsed = JSON.parse(presetText) as Record<string, unknown>;
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        throw new Error("Preset config must be a JSON object.");
      }
      await createConfig.mutateAsync({
        key: "test.presets",
        configJson: parsed,
      });
      toast({ title: "Test preset draft created" });
    } catch (err) {
      toast({
        title: "Invalid preset JSON",
        description:
          err instanceof Error
            ? err.message
            : "Unable to parse preset configuration.",
        variant: "destructive",
      });
    }
  };

  const publishLatestLanguage = async () => {
    if (!latestLanguage) return;
    try {
      await publishConfig.mutateAsync(latestLanguage.id);
      toast({ title: "Language settings published" });
    } catch (err) {
      toast({
        title: "Publish failed",
        description:
          err && typeof err === "object" && "message" in err
            ? String(err.message)
            : "Unable to publish language settings.",
        variant: "destructive",
      });
    }
  };

  const publishLatestPreset = async () => {
    if (!latestPreset) return;
    try {
      await publishConfig.mutateAsync(latestPreset.id);
      toast({ title: "Test presets published" });
    } catch (err) {
      toast({
        title: "Publish failed",
        description:
          err && typeof err === "object" && "message" in err
            ? String(err.message)
            : "Unable to publish test presets.",
        variant: "destructive",
      });
    }
  };

  return (
    <RequirePerm perm="admin.config.write">
      <div className="space-y-6">
        <PageHeader
          title="CMS Settings"
          description="Control application languages and competitive test presets from admin panel."
        />
        <CmsSubNav />

        <section className="space-y-4 rounded-2xl border border-border bg-card p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-semibold">Language Settings</h2>
              <p className="text-sm text-muted-foreground">
                Enable English, Hindi, Marathi and choose the default app language.
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={saveLanguageDraft}>
                Save Draft
              </Button>
              <Button variant="cta" onClick={publishLatestLanguage} disabled={!latestLanguage}>
                Publish Latest
              </Button>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            {LANGUAGES.map((language) => (
              <label
                key={language.key}
                className="flex items-center gap-2 rounded-2xl border border-border bg-background px-3 py-2 text-sm"
              >
                <input
                  type="checkbox"
                  checked={enabledLanguages.includes(language.key)}
                  onChange={() => toggleLanguage(language.key)}
                />
                {language.label}
              </label>
            ))}
          </div>

          <FormSelect
            label="Default Language"
            value={defaultLanguage}
            onChange={(event) => setDefaultLanguage(event.target.value as LanguageKey)}
          >
            {enabledLanguages.map((language) => (
              <option key={language} value={language}>
                {LANGUAGES.find((item) => item.key === language)?.label ?? language}
              </option>
            ))}
          </FormSelect>

          <p className="text-xs text-muted-foreground">
            Latest version: {latestLanguage ? `v${latestLanguage.version} (${latestLanguage.status})` : "Not created"}
          </p>
        </section>

        <section className="space-y-4 rounded-2xl border border-border bg-card p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-semibold">Test Preset Settings</h2>
              <p className="text-sm text-muted-foreground">
                Configure exam presets consumed by the admin test builder.
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={savePresetDraft}>
                Save Draft
              </Button>
              <Button variant="cta" onClick={publishLatestPreset} disabled={!latestPreset}>
                Publish Latest
              </Button>
            </div>
          </div>

          <FormTextarea
            label="Preset JSON"
            value={presetText}
            onChange={(event) => setPresetText(event.target.value)}
            className="min-h-[260px]"
          />

          <p className="text-xs text-muted-foreground">
            Latest version: {latestPreset ? `v${latestPreset.version} (${latestPreset.status})` : "Not created"}
          </p>
        </section>
      </div>
    </RequirePerm>
  );
}
