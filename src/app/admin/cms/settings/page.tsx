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
import {
  buildSiteSettingsPayload,
  createDefaultSiteSettingValues,
  mapSiteSettingsToEditor,
  SITE_SETTING_GROUPS,
  SITE_SETTINGS_CONFIG_KEY,
  type SiteSettingField,
  type SiteSettingValue,
} from "@/modules/cms/site-settings";
import type { AppConfig } from "@/modules/cms/types";
import {
  FormInput,
  FormSelect,
  FormSwitch,
  FormTextarea,
} from "@/modules/shared/components/FormField";
import { PageHeader } from "@/modules/shared/components/PageHeader";
import { splitPresetConfig } from "@/modules/shared/structured-data";
import { useToast } from "@/modules/shared/components/Toast";
import { useSubjects } from "@/modules/taxonomy/subjects/hooks";
import {
  buildPresetsFromEditor,
  mapPresetsToEditor,
  TestPresetsEditor,
  type EditableTestPreset,
} from "@/modules/tests/components/TestSectionsEditor";

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
  return (
    sortByVersionDesc(configs).find((item) => item.status === "PUBLISHED") ??
    null
  );
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
  const { data: siteSettingConfigsData } = useConfigs({
    key: SITE_SETTINGS_CONFIG_KEY,
    page: 1,
    pageSize: 50,
  });

  const languageConfigs = languageConfigsData?.data ?? [];
  const presetConfigs = presetConfigsData?.data ?? [];
  const siteSettingConfigs = siteSettingConfigsData?.data ?? [];

  const latestLanguage = getLatest(languageConfigs);
  const latestLanguagePublished = getLatestPublished(languageConfigs);
  const latestPreset = getLatest(presetConfigs);
  const latestPresetPublished = getLatestPublished(presetConfigs);
  const latestSiteSettings = getLatest(siteSettingConfigs);
  const latestSiteSettingsPublished = getLatestPublished(siteSettingConfigs);
  const { data: subjects } = useSubjects();

  const [enabledLanguages, setEnabledLanguages] = React.useState<LanguageKey[]>(
    ["en", "hi", "mr"],
  );
  const [defaultLanguage, setDefaultLanguage] = React.useState<LanguageKey>("en");
  const [presetEntries, setPresetEntries] = React.useState<EditableTestPreset[]>(
    [],
  );
  const [presetPreserved, setPresetPreserved] = React.useState<
    Record<string, unknown>
  >({});
  const [siteSettingValues, setSiteSettingValues] = React.useState<
    Record<string, SiteSettingValue>
  >(createDefaultSiteSettingValues);
  const [siteSettingPreserved, setSiteSettingPreserved] = React.useState<
    Record<string, unknown>
  >({});

  React.useEffect(() => {
    const source = getConfigJson(latestLanguagePublished ?? latestLanguage);
    const rawEnabled = Array.isArray(source.enabledLanguages)
      ? source.enabledLanguages
      : Array.isArray(source.languages)
        ? source.languages
        : [];
    const nextEnabled = rawEnabled.filter(
      (item): item is LanguageKey =>
        LANGUAGES.some((lang) => lang.key === item),
    );

    if (nextEnabled.length) {
      setEnabledLanguages(Array.from(new Set(nextEnabled)));
    }

    const rawDefault = source.defaultLanguage;
    if (
      typeof rawDefault === "string" &&
      LANGUAGES.some((lang) => lang.key === rawDefault)
    ) {
      setDefaultLanguage(rawDefault as LanguageKey);
    }
  }, [latestLanguage, latestLanguagePublished]);

  React.useEffect(() => {
    const source = getConfigJson(latestPresetPublished ?? latestPreset);
    const presetState = splitPresetConfig(source);
    setPresetEntries(
      mapPresetsToEditor(
        presetState.presets as Parameters<typeof mapPresetsToEditor>[0],
      ),
    );
    setPresetPreserved(presetState.preserved);
  }, [latestPreset, latestPresetPublished]);

  React.useEffect(() => {
    const source = getConfigJson(latestSiteSettingsPublished ?? latestSiteSettings);
    const mapped = mapSiteSettingsToEditor(source);
    setSiteSettingValues(mapped.values);
    setSiteSettingPreserved(mapped.preserved);
  }, [latestSiteSettings, latestSiteSettingsPublished]);

  const updateSiteSetting = React.useCallback(
    (key: string, value: SiteSettingValue) => {
      setSiteSettingValues((current) => ({ ...current, [key]: value }));
    },
    [],
  );

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
      const presets = buildPresetsFromEditor(presetEntries);
      await createConfig.mutateAsync({
        key: "test.presets",
        configJson: {
          ...presetPreserved,
          presets,
        },
      });
      toast({ title: "Test preset draft created" });
    } catch (err) {
      toast({
        title: "Unable to save preset settings",
        description:
          err instanceof Error
            ? err.message
            : "Unable to save preset configuration.",
        variant: "destructive",
      });
    }
  };

  const saveSiteSettingsDraft = async () => {
    try {
      await createConfig.mutateAsync({
        key: SITE_SETTINGS_CONFIG_KEY,
        configJson: buildSiteSettingsPayload(
          siteSettingValues,
          siteSettingPreserved,
        ),
      });
      toast({ title: "Site settings draft created" });
    } catch (err) {
      toast({
        title: "Unable to save site settings",
        description:
          err instanceof Error
            ? err.message
            : "Unable to save site settings draft.",
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

  const publishLatestSiteSettings = async () => {
    if (!latestSiteSettings) return;
    try {
      await publishConfig.mutateAsync(latestSiteSettings.id);
      toast({ title: "Site settings published" });
    } catch (err) {
      toast({
        title: "Publish failed",
        description:
          err && typeof err === "object" && "message" in err
            ? String(err.message)
            : "Unable to publish site settings.",
        variant: "destructive",
      });
    }
  };

  const renderSiteSettingField = (field: SiteSettingField) => {
    const value = siteSettingValues[field.key] ?? field.defaultValue;

    if (field.inputType === "boolean") {
      return (
        <FormSwitch
          key={field.key}
          label={field.label}
          description={field.description}
          checked={Boolean(value)}
          onCheckedChange={(checked) => updateSiteSetting(field.key, checked)}
        />
      );
    }

    if (field.inputType === "number") {
      const numericValue =
        typeof value === "number" && Number.isFinite(value)
          ? value
          : Number(field.defaultValue);
      return (
        <FormInput
          key={field.key}
          type="number"
          label={field.label}
          description={field.description}
          value={numericValue}
          min={field.min}
          step={field.step}
          onChange={(event) => {
            const parsed = Number(event.target.value);
            updateSiteSetting(
              field.key,
              Number.isFinite(parsed) ? parsed : Number(field.defaultValue),
            );
          }}
        />
      );
    }

    if (field.inputType === "textarea") {
      return (
        <FormTextarea
          key={field.key}
          label={field.label}
          description={field.description}
          value={String(value)}
          placeholder={field.placeholder}
          onChange={(event) => updateSiteSetting(field.key, event.target.value)}
        />
      );
    }

    if (field.inputType === "select") {
      return (
        <FormSelect
          key={field.key}
          label={field.label}
          description={field.description}
          value={String(value)}
          onChange={(event) => updateSiteSetting(field.key, event.target.value)}
        >
          {(field.options ?? []).map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </FormSelect>
      );
    }

    return (
      <FormInput
        key={field.key}
        type="text"
        label={field.label}
        description={field.description}
        value={String(value)}
        placeholder={field.placeholder}
        onChange={(event) => updateSiteSetting(field.key, event.target.value)}
      />
    );
  };

  return (
    <RequirePerm perm="admin.config.write">
      <div className="space-y-6">
        <PageHeader
          title="CMS Settings"
          description="Control languages, test presets, and grouped site-level runtime settings from admin."
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
              <Button
                variant="cta"
                onClick={publishLatestLanguage}
                disabled={!latestLanguage}
              >
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
            Latest version:{" "}
            {latestLanguage
              ? `v${latestLanguage.version} (${latestLanguage.status})`
              : "Not created"}
          </p>
        </section>

        <section className="space-y-4 rounded-2xl border border-border bg-card p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-semibold">Site Settings</h2>
              <p className="text-sm text-muted-foreground">
                Grouped runtime variables with friendly labels for easier admin updates.
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={saveSiteSettingsDraft}>
                Save Draft
              </Button>
              <Button
                variant="cta"
                onClick={publishLatestSiteSettings}
                disabled={!latestSiteSettings}
              >
                Publish Latest
              </Button>
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            {SITE_SETTING_GROUPS.map((group) => (
              <article
                key={group.id}
                className="space-y-4 rounded-2xl border border-border bg-background p-4"
              >
                <div>
                  <h3 className="text-sm font-semibold">{group.title}</h3>
                  <p className="text-xs text-muted-foreground">{group.description}</p>
                </div>
                <div className="space-y-3">
                  {group.fields.map((field) => renderSiteSettingField(field))}
                </div>
              </article>
            ))}
          </div>

          <p className="text-xs text-muted-foreground">
            Latest version:{" "}
            {latestSiteSettings
              ? `v${latestSiteSettings.version} (${latestSiteSettings.status})`
              : "Not created"}
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

          <TestPresetsEditor
            presets={presetEntries}
            onChange={setPresetEntries}
            subjects={subjects}
          />

          <p className="text-xs text-muted-foreground">
            Latest version:{" "}
            {latestPreset
              ? `v${latestPreset.version} (${latestPreset.status})`
              : "Not created"}
          </p>
        </section>
      </div>
    </RequirePerm>
  );
}
