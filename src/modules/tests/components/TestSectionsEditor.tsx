"use client";

import * as React from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormInput, FormSelect } from "@/modules/shared/components/FormField";
import { StringListEditor } from "@/modules/shared/components/StructuredEditors";
import type { Subject } from "@/modules/taxonomy/subjects/types";
import type { TestConfig, TestDifficulty, TestPreset } from "../types";
import { createStructuredId } from "@/modules/shared/structured-data";

export type EditableTestSection = {
  id: string;
  key: string;
  title: string;
  count: string;
  durationMinutes: string;
  subjectId: string;
  difficulty: "" | TestDifficulty;
  marksPerQuestion: string;
  negativeMarksPerWrong: string;
  topicIds: string[];
  questionIds: string[];
};

export type EditableTestPreset = {
  id: string;
  key: string;
  title: string;
  exam: string;
  description: string;
  durationMinutes: string;
  marksPerQuestion: string;
  negativeMarksPerWrong: string;
  sections: EditableTestSection[];
};

function createEmptySection(): EditableTestSection {
  return {
    id: createStructuredId("section"),
    key: "",
    title: "",
    count: "",
    durationMinutes: "",
    subjectId: "",
    difficulty: "",
    marksPerQuestion: "",
    negativeMarksPerWrong: "",
    topicIds: [],
    questionIds: [],
  };
}

function parsePositiveInt(value: string) {
  const parsed = Number(value.trim());
  return Number.isFinite(parsed) && parsed > 0 ? Math.round(parsed) : undefined;
}

function parsePositiveNumber(value: string) {
  const parsed = Number(value.trim());
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

function parseNonNegativeNumber(value: string) {
  const parsed = Number(value.trim());
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
}

export function mapSectionsToEditor(
  sections: TestConfig["sections"] | undefined
): EditableTestSection[] {
  return (sections || []).map((section) => ({
    id: createStructuredId("section"),
    key: section.key || "",
    title: section.title || "",
    count: String(section.count ?? ""),
    durationMinutes:
      section.durationMinutes !== undefined ? String(section.durationMinutes) : "",
    subjectId: section.subjectId || "",
    difficulty: section.difficulty || "",
    marksPerQuestion:
      section.marksPerQuestion !== undefined ? String(section.marksPerQuestion) : "",
    negativeMarksPerWrong:
      section.negativeMarksPerWrong !== undefined
        ? String(section.negativeMarksPerWrong)
        : "",
    topicIds: section.topicIds ?? [],
    questionIds: section.questionIds ?? [],
  }));
}

export function buildSectionsFromEditor(sections: EditableTestSection[]) {
  return sections
    .map((section) => {
      const count = parsePositiveInt(section.count);
      if (!count) {
        return null;
      }

      const payload: NonNullable<TestConfig["sections"]>[number] = {
        count,
      };

      if (section.key.trim()) payload.key = section.key.trim();
      if (section.title.trim()) payload.title = section.title.trim();
      const durationMinutes = parsePositiveInt(section.durationMinutes);
      if (durationMinutes) payload.durationMinutes = durationMinutes;
      if (section.subjectId.trim()) payload.subjectId = section.subjectId.trim();
      if (section.difficulty) payload.difficulty = section.difficulty;
      const marksPerQuestion = parsePositiveNumber(section.marksPerQuestion);
      if (marksPerQuestion !== undefined) payload.marksPerQuestion = marksPerQuestion;
      const negativeMarksPerWrong = parseNonNegativeNumber(section.negativeMarksPerWrong);
      if (negativeMarksPerWrong !== undefined) {
        payload.negativeMarksPerWrong = negativeMarksPerWrong;
      }
      if (section.topicIds.length) {
        payload.topicIds = section.topicIds.map((item) => item.trim()).filter(Boolean);
      }
      if (section.questionIds.length) {
        payload.questionIds = section.questionIds.map((item) => item.trim()).filter(Boolean);
      }

      return payload;
    })
    .filter((section): section is NonNullable<TestConfig["sections"]>[number] => Boolean(section));
}

function buildPresetSectionsFromEditor(
  sections: EditableTestSection[]
): TestPreset["sections"] {
  return buildSectionsFromEditor(sections)
    .map((section) => {
      const key = section.key?.trim();
      const title = section.title?.trim();
      if (!key || !title) {
        return null;
      }

      return {
        ...section,
        key,
        title,
      };
    })
    .filter((section): section is TestPreset["sections"][number] => Boolean(section));
}

export function mapPresetsToEditor(presets: TestPreset[] | undefined): EditableTestPreset[] {
  return (presets || []).map((preset) => ({
    id: createStructuredId("preset"),
    key: preset.key,
    title: preset.title,
    exam: preset.exam,
    description: preset.description || "",
    durationMinutes: String(preset.durationMinutes ?? ""),
    marksPerQuestion: String(preset.marksPerQuestion ?? ""),
    negativeMarksPerWrong: String(preset.negativeMarksPerWrong ?? ""),
    sections: mapSectionsToEditor(preset.sections),
  }));
}

export function buildPresetsFromEditor(presets: EditableTestPreset[]): TestPreset[] {
  const built: TestPreset[] = [];

  presets.forEach((preset) => {
    const durationMinutes = parsePositiveInt(preset.durationMinutes);
    const marksPerQuestion = parsePositiveNumber(preset.marksPerQuestion);
    const negativeMarksPerWrong = parseNonNegativeNumber(preset.negativeMarksPerWrong);
    const sections = buildPresetSectionsFromEditor(preset.sections);

    if (
      !preset.key.trim() ||
      !preset.title.trim() ||
      !preset.exam.trim() ||
      !durationMinutes ||
      marksPerQuestion === undefined ||
      negativeMarksPerWrong === undefined ||
      sections.length === 0
    ) {
      return;
    }

    built.push({
      key: preset.key.trim(),
      title: preset.title.trim(),
      exam: preset.exam.trim(),
      description: preset.description.trim() || undefined,
      durationMinutes,
      marksPerQuestion,
      negativeMarksPerWrong,
      sections,
    });
  });

  return built;
}

export function TestSectionsEditor({
  label,
  description,
  sections,
  onChange,
  subjects,
}: {
  label: string;
  description?: string;
  sections: EditableTestSection[];
  onChange: (next: EditableTestSection[]) => void;
  subjects?: Subject[];
}) {
  const updateSection = (index: number, patch: Partial<EditableTestSection>) => {
    const next = [...sections];
    next[index] = { ...next[index], ...patch };
    onChange(next);
  };

  const removeSection = (index: number) => {
    onChange(sections.filter((_, currentIndex) => currentIndex !== index));
  };

  const addSection = () => {
    onChange([...sections, createEmptySection()]);
  };

  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        {description ? <p className="text-xs text-muted-foreground">{description}</p> : null}
      </div>

      {sections.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-4 text-sm text-muted-foreground">
          No sections added yet.
        </div>
      ) : (
        sections.map((section, index) => (
          <div key={section.id} className="space-y-4 rounded-2xl border border-border bg-card/50 p-4">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-foreground">Section {index + 1}</p>
              <Button type="button" variant="ghost" size="sm" onClick={() => removeSection(index)}>
                <Trash2 className="h-4 w-4" />
                Remove
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <FormInput
                label="Section Key"
                placeholder="reasoning"
                value={section.key}
                onChange={(event) => updateSection(index, { key: event.target.value })}
              />
              <FormInput
                label="Section Title"
                placeholder="Reasoning"
                value={section.title}
                onChange={(event) => updateSection(index, { title: event.target.value })}
              />
              <FormInput
                label="Question Count"
                type="number"
                min="1"
                value={section.count}
                onChange={(event) => updateSection(index, { count: event.target.value })}
              />
              <FormInput
                label="Section Duration (minutes)"
                type="number"
                min="1"
                value={section.durationMinutes}
                onChange={(event) =>
                  updateSection(index, { durationMinutes: event.target.value })
                }
              />
              {subjects?.length ? (
                <FormSelect
                  label="Subject Filter"
                  value={section.subjectId}
                  onChange={(event) => updateSection(index, { subjectId: event.target.value })}
                >
                  <option value="">All subjects</option>
                  {subjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name || subject.title || "Untitled"}
                    </option>
                  ))}
                </FormSelect>
              ) : null}
              <FormSelect
                label="Difficulty"
                value={section.difficulty}
                onChange={(event) =>
                  updateSection(index, {
                    difficulty: event.target.value as EditableTestSection["difficulty"],
                  })
                }
              >
                <option value="">All difficulties</option>
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
              </FormSelect>
              <FormInput
                label="Marks Per Question"
                type="number"
                min="0"
                step="0.01"
                value={section.marksPerQuestion}
                onChange={(event) =>
                  updateSection(index, { marksPerQuestion: event.target.value })
                }
              />
              <FormInput
                label="Negative Marks / Wrong"
                type="number"
                min="0"
                step="0.01"
                value={section.negativeMarksPerWrong}
                onChange={(event) =>
                  updateSection(index, { negativeMarksPerWrong: event.target.value })
                }
              />
            </div>

            <StringListEditor
              label="Topic IDs"
              description="Optional advanced filter. Add one topic id per row."
              values={section.topicIds}
              onChange={(next) => updateSection(index, { topicIds: next })}
              itemLabel="Topic ID"
              addLabel="Add topic ID"
            />

            <StringListEditor
              label="Fixed Question IDs"
              description="Optional. Add fixed question ids only if this section should use exact questions."
              values={section.questionIds}
              onChange={(next) => updateSection(index, { questionIds: next })}
              itemLabel="Question ID"
              addLabel="Add question ID"
            />
          </div>
        ))
      )}

      <Button type="button" variant="secondary" size="sm" onClick={addSection}>
        <Plus className="h-4 w-4" />
        Add Section
      </Button>
    </div>
  );
}

export function TestPresetsEditor({
  presets,
  onChange,
  subjects,
}: {
  presets: EditableTestPreset[];
  onChange: (next: EditableTestPreset[]) => void;
  subjects?: Subject[];
}) {
  const updatePreset = (index: number, patch: Partial<EditableTestPreset>) => {
    const next = [...presets];
    next[index] = { ...next[index], ...patch };
    onChange(next);
  };

  const removePreset = (index: number) => {
    onChange(presets.filter((_, currentIndex) => currentIndex !== index));
  };

  const addPreset = () => {
    onChange([
      ...presets,
      {
        id: createStructuredId("preset"),
        key: "",
        title: "",
        exam: "",
        description: "",
        durationMinutes: "",
        marksPerQuestion: "",
        negativeMarksPerWrong: "",
        sections: [],
      },
    ]);
  };

  return (
    <div className="space-y-4">
      {presets.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-4 text-sm text-muted-foreground">
          No presets added yet.
        </div>
      ) : (
        presets.map((preset, index) => (
          <div key={preset.id} className="space-y-4 rounded-2xl border border-border bg-card/60 p-4">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-foreground">Preset {index + 1}</p>
              <Button type="button" variant="ghost" size="sm" onClick={() => removePreset(index)}>
                <Trash2 className="h-4 w-4" />
                Remove
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <FormInput
                label="Preset Key"
                placeholder="ssc-cgl-tier1-100"
                value={preset.key}
                onChange={(event) => updatePreset(index, { key: event.target.value })}
              />
              <FormInput
                label="Preset Title"
                placeholder="SSC CGL Tier-I - 100"
                value={preset.title}
                onChange={(event) => updatePreset(index, { title: event.target.value })}
              />
              <FormInput
                label="Exam"
                placeholder="SSC CGL / CHSL"
                value={preset.exam}
                onChange={(event) => updatePreset(index, { exam: event.target.value })}
              />
              <FormInput
                label="Duration (minutes)"
                type="number"
                min="1"
                value={preset.durationMinutes}
                onChange={(event) =>
                  updatePreset(index, { durationMinutes: event.target.value })
                }
              />
              <FormInput
                label="Marks Per Question"
                type="number"
                min="0"
                step="0.01"
                value={preset.marksPerQuestion}
                onChange={(event) =>
                  updatePreset(index, { marksPerQuestion: event.target.value })
                }
              />
              <FormInput
                label="Negative Marks / Wrong"
                type="number"
                min="0"
                step="0.01"
                value={preset.negativeMarksPerWrong}
                onChange={(event) =>
                  updatePreset(index, { negativeMarksPerWrong: event.target.value })
                }
              />
            </div>

            <FormInput
              label="Description"
              placeholder="Optional description"
              value={preset.description}
              onChange={(event) => updatePreset(index, { description: event.target.value })}
            />

            <TestSectionsEditor
              label="Sections"
              sections={preset.sections}
              onChange={(next) => updatePreset(index, { sections: next })}
              subjects={subjects}
            />
          </div>
        ))
      )}

      <Button type="button" variant="secondary" size="sm" onClick={addPreset}>
        <Plus className="h-4 w-4" />
        Add Preset
      </Button>
    </div>
  );
}
