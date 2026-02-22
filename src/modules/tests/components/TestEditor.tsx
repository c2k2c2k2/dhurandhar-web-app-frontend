"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth/AuthProvider";
import { hasPermission } from "@/lib/auth/permissions";
import { useToast } from "@/modules/shared/components/Toast";
import {
  FormField,
  FormInput,
  FormSelect,
  FormTextarea,
  FormSwitch,
} from "@/modules/shared/components/FormField";
import { MultiSelectField } from "@/modules/shared/components/MultiSelect";
import { ErrorState, LoadingState } from "@/modules/shared/components/States";
import { useSubjects } from "@/modules/taxonomy/subjects/hooks";
import { useTopics } from "@/modules/taxonomy/topics/hooks";
import type { Topic } from "@/modules/taxonomy/topics/types";
import { getQuestion } from "@/modules/questions/api";
import { extractText, truncateText } from "@/modules/questions/utils";
import { TestFormSchema, type TestFormValues } from "../schemas";
import type { TestConfig, TestItem, TestType } from "../types";
import { useCreateTest, useTest, useTestPresets, useUpdateTest } from "../hooks";

function getTopicName(topic: Topic) {
  return topic.name || topic.title || "Untitled";
}

function formatDateInput(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (num: number) => String(num).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function parseDateInput(value?: string) {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toISOString();
}

function parseQuestionIds(text?: string) {
  if (!text) return [];
  return text
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseSectionsJson(text?: string) {
  const trimmed = text?.trim();
  if (!trimmed) return undefined;
  const parsed = JSON.parse(trimmed) as unknown;
  if (!Array.isArray(parsed)) {
    throw new Error("Sections JSON must be an array.");
  }
  return parsed as TestConfig["sections"];
}

function mapTestToForm(test: TestItem): TestFormValues {
  const config = (test.configJson || {}) as TestConfig;
  const questionIds =
    config.items?.map((item) => item.questionId) ??
    config.questionIds ??
    [];

  return {
    title: test.title,
    description: test.description || "",
    type: test.type,
    subjectId: test.subjectId ?? "",
    startsAt: formatDateInput(test.startsAt),
    endsAt: formatDateInput(test.endsAt),
    mixerCount: config.mixer?.count ?? undefined,
    mixerDifficulty: config.mixer?.difficulty,
    mixerTopicIds: config.mixer?.topicIds ?? [],
    presetKey: config.presetKey ?? "",
    questionIdsText: questionIds.join("\n"),
    sectionsJson: Array.isArray(config.sections)
      ? JSON.stringify(config.sections, null, 2)
      : "",
    durationMinutes: config.durationMinutes ?? undefined,
    marksPerQuestion: config.marksPerQuestion ?? undefined,
    negativeMarksPerWrong: config.negativeMarksPerWrong ?? undefined,
    isPublished: test.isPublished,
  };
}

export function TestEditor({ testId }: { testId?: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const canPublish = hasPermission(user, "tests.publish");
  const isEdit = Boolean(testId);

  const {
    data: test,
    isLoading: testLoading,
    error: testError,
  } = useTest(testId);

  const {
    data: subjects,
    isLoading: subjectsLoading,
    error: subjectsError,
  } = useSubjects();

  const form = useForm<TestFormValues>({
    resolver: zodResolver(TestFormSchema),
    defaultValues: {
      title: "",
      description: "",
      type: "SUBJECT",
      subjectId: "",
      startsAt: "",
      endsAt: "",
      mixerCount: undefined,
      mixerDifficulty: undefined,
      mixerTopicIds: [],
      presetKey: "",
      questionIdsText: "",
      sectionsJson: "",
      durationMinutes: undefined,
      marksPerQuestion: undefined,
      negativeMarksPerWrong: undefined,
      isPublished: false,
    },
  });

  const selectedSubjectId = form.watch("subjectId");
  const currentType = form.watch("type");
  const questionIdsText = form.watch("questionIdsText") || "";
  const presetKey = form.watch("presetKey") || "";
  const { data: topics, isLoading: topicsLoading } = useTopics(
    selectedSubjectId || undefined
  );
  const { data: presets = [] } = useTestPresets();

  const createTest = useCreateTest();
  const updateTest = useUpdateTest();

  React.useEffect(() => {
    if (isEdit && test) {
      form.reset(mapTestToForm(test));
    }
  }, [isEdit, test, form]);

  const handleSubmit = async (values: TestFormValues) => {
    const questionIds = parseQuestionIds(values.questionIdsText);
    const config: TestConfig = {};

    if (values.type === "CUSTOM") {
      config.questionIds = questionIds;
    } else {
      if (values.presetKey) {
        config.presetKey = values.presetKey;
      } else {
        config.mixer = {
          subjectId: values.subjectId || undefined,
          topicIds: values.mixerTopicIds?.length ? values.mixerTopicIds : undefined,
          difficulty: values.mixerDifficulty,
          count: values.mixerCount || 0,
        };
      }
    }

    try {
      if (values.sectionsJson?.trim()) {
        config.sections = parseSectionsJson(values.sectionsJson);
      }
    } catch (err) {
      toast({
        title: "Invalid sections JSON",
        description:
          err instanceof Error
            ? err.message
            : "Unable to parse sections JSON.",
        variant: "destructive",
      });
      return;
    }

    if (values.marksPerQuestion) {
      config.marksPerQuestion = values.marksPerQuestion;
    }

    if (values.durationMinutes) {
      config.durationMinutes = values.durationMinutes;
    }

    if (values.negativeMarksPerWrong !== undefined) {
      config.negativeMarksPerWrong = values.negativeMarksPerWrong;
    }

    const payload = {
      subjectId: values.subjectId || undefined,
      title: values.title,
      description: values.description || undefined,
      type: values.type,
      configJson: config,
      isPublished: canPublish ? values.isPublished ?? false : undefined,
      startsAt: parseDateInput(values.startsAt),
      endsAt: parseDateInput(values.endsAt),
    };

    try {
      if (isEdit && testId) {
        await updateTest.mutateAsync({ testId, input: payload });
        toast({ title: "Test updated" });
      } else {
        const created = await createTest.mutateAsync(payload);
        toast({ title: "Test created" });
        router.replace(`/admin/tests/${created.id}`);
      }
    } catch (err) {
      toast({
        title: "Save failed",
        description:
          err && typeof err === "object" && "message" in err
            ? String(err.message)
            : "Unable to save test.",
        variant: "destructive",
      });
    }
  };

  const topicOptions = topics || [];
  const topicList = React.useMemo(() => {
    const byId = new Map(topicOptions.map((topic) => [topic.id, topic]));
    const buildLabel = (topic: Topic) => {
      const parts: string[] = [];
      let current: Topic | undefined = topic;
      let safety = 0;
      while (current && safety < 20) {
        parts.unshift(getTopicName(current));
        if (!current.parentId) break;
        current = byId.get(current.parentId);
        safety += 1;
      }
      return parts.join(" / ");
    };
    return topicOptions
      .map((topic) => ({ id: topic.id, label: buildLabel(topic) }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [topicOptions]);

  const previewQuestionIds = React.useMemo(() => {
    const ids = parseQuestionIds(questionIdsText);
    const unique = Array.from(new Set(ids));
    return unique;
  }, [questionIdsText]);

  const previewLimit = 50;
  const previewIds = previewQuestionIds.slice(0, previewLimit);
  const hasMorePreviewIds = previewQuestionIds.length > previewLimit;

  const { data: previewItems, isLoading: previewLoading } = useQuery({
    queryKey: ["admin", "tests", "preview-questions", previewIds],
    queryFn: async () => {
      const results = await Promise.allSettled(
        previewIds.map((questionId) => getQuestion(questionId))
      );
      return results.map((result, index) => {
        const questionId = previewIds[index];
        if (result.status === "fulfilled") {
          return { id: questionId, status: "ok" as const, question: result.value };
        }
        return {
          id: questionId,
          status: "error" as const,
          message:
            result.reason && typeof result.reason === "object" && "message" in result.reason
              ? String(result.reason.message)
              : "Unable to load question.",
        };
      });
    },
    enabled: currentType === "CUSTOM" && previewIds.length > 0,
  });

  if (isEdit && testLoading) {
    return <LoadingState label="Loading test..." />;
  }

  if (isEdit && testError) {
    return (
      <ErrorState
        description={
          testError && typeof testError === "object" && "message" in testError
            ? String(testError.message)
            : "Unable to load test."
        }
      />
    );
  }

  if (isEdit && !test) {
    return <ErrorState description="Test not found." />;
  }

  return (
    <form className="space-y-6" onSubmit={form.handleSubmit(handleSubmit)}>
      {subjectsLoading ? (
        <LoadingState label="Loading subjects..." />
      ) : subjectsError ? (
        <ErrorState
          description={
            subjectsError && typeof subjectsError === "object" && "message" in subjectsError
              ? String(subjectsError.message)
              : "Unable to load subjects."
          }
        />
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <FormInput
              label="Title"
              placeholder="e.g., Weekly Practice Test 1"
              error={form.formState.errors.title?.message}
              {...form.register("title")}
            />
            <FormTextarea
              label="Description"
              placeholder="Optional description"
              error={form.formState.errors.description?.message}
              {...form.register("description")}
            />
            {currentType === "CUSTOM" ? (
              <div className="space-y-4">
                <FormTextarea
                  label="Question IDs"
                  description="One id per line or comma-separated."
                  error={form.formState.errors.questionIdsText?.message}
                  placeholder="cml8... \ncml9..."
                  {...form.register("questionIdsText")}
                />
                <div className="rounded-2xl border border-border bg-card p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold">Question preview</p>
                      <p className="text-xs text-muted-foreground">
                        Shows details for fixed questions in this test.
                      </p>
                    </div>
                    {previewQuestionIds.length ? (
                      <span className="text-xs text-muted-foreground">
                        {previewQuestionIds.length} total
                      </span>
                    ) : null}
                  </div>

                  {!previewQuestionIds.length ? (
                    <p className="mt-3 text-sm text-muted-foreground">
                      Add question IDs above to preview them here.
                    </p>
                  ) : previewLoading ? (
                    <div className="mt-3">
                      <LoadingState
                        label="Loading questions..."
                        className="border-0 bg-transparent px-0 py-0"
                      />
                    </div>
                  ) : (
                    <div className="mt-3 space-y-3">
                      {previewItems?.map((item) =>
                        item.status === "ok" ? (
                          <div
                            key={item.id}
                            className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-border px-3 py-2"
                          >
                            <div className="space-y-1">
                              <p className="text-sm font-medium">
                                {truncateText(
                                  extractText(item.question.statementJson) || "Untitled question",
                                  140
                                )}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {item.question.id} •{" "}
                                {item.question.type.replace(/_/g, " ")}
                                {item.question.difficulty
                                  ? ` • ${item.question.difficulty}`
                                  : ""}
                              </p>
                            </div>
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/admin/questions/${item.question.id}`}>
                                Open
                              </Link>
                            </Button>
                          </div>
                        ) : (
                          <div
                            key={item.id}
                            className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
                          >
                            {item.id}: {item.message}
                          </div>
                        )
                      )}
                      {hasMorePreviewIds ? (
                        <p className="text-xs text-muted-foreground">
                          Showing first {previewLimit} questions.
                        </p>
                      ) : null}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <FormSelect
                  label="Preset (optional)"
                  value={presetKey}
                  onChange={(event) => {
                    form.setValue("presetKey", event.target.value);
                    if (!event.target.value) return;
                    const preset = presets.find((item) => item.key === event.target.value);
                    if (!preset) return;
                    form.setValue("durationMinutes", preset.durationMinutes);
                    form.setValue("marksPerQuestion", preset.marksPerQuestion);
                    form.setValue("negativeMarksPerWrong", preset.negativeMarksPerWrong);
                    form.setValue("sectionsJson", JSON.stringify(preset.sections, null, 2));
                  }}
                >
                  <option value="">No preset (use mixer)</option>
                  {presets.map((preset) => (
                    <option key={preset.key} value={preset.key}>
                      {preset.title} ({preset.exam})
                    </option>
                  ))}
                </FormSelect>

                {!presetKey ? (
                  <>
                    <FormInput
                      label="Question Count"
                      type="number"
                      placeholder="e.g., 50"
                      error={form.formState.errors.mixerCount?.message}
                      {...form.register("mixerCount", {
                        setValueAs: (value) => {
                          if (value === "" || value === null || value === undefined) {
                            return undefined;
                          }
                          const parsed = Number(value);
                          return Number.isNaN(parsed) ? undefined : parsed;
                        },
                      })}
                    />
                    <FormSelect
                      label="Difficulty"
                      value={form.watch("mixerDifficulty") || ""}
                      onChange={(event) =>
                        form.setValue(
                          "mixerDifficulty",
                          event.target.value
                            ? (event.target.value as TestFormValues["mixerDifficulty"])
                            : undefined
                        )
                      }
                    >
                      <option value="">All difficulties</option>
                      <option value="EASY">Easy</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HARD">Hard</option>
                    </FormSelect>
                    <MultiSelectField
                      label="Topics"
                      description="Optional topic filters."
                      items={topicList}
                      value={form.watch("mixerTopicIds") || []}
                      onChange={(next) => form.setValue("mixerTopicIds", next)}
                      loading={topicsLoading}
                      emptyLabel="No topics found for this subject."
                      searchPlaceholder="Search topics..."
                      modalTitle="Select topics"
                      modalDescription="Pick topics for the mixer."
                      selectLabel="Select topics"
                      editLabel="Edit topics"
                      disabled={!selectedSubjectId}
                    />
                    <div className="rounded-2xl border border-border bg-muted/40 px-4 py-3 text-xs text-muted-foreground">
                      Questions are selected when the test starts based on the mixer
                      rules. There is no fixed list to display in advance.
                    </div>
                  </>
                ) : (
                  <div className="rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3 text-xs text-muted-foreground">
                    Preset is active. You can adjust sections using the JSON field below.
                  </div>
                )}

                <FormTextarea
                  label="Sections JSON (optional)"
                  description="Use to define section-wise count/time/marking rules."
                  error={form.formState.errors.sectionsJson?.message}
                  className="min-h-[170px]"
                  placeholder='[{\"key\":\"reasoning\",\"title\":\"Reasoning\",\"count\":15}]'
                  {...form.register("sectionsJson")}
                />
              </div>
            )}
            <FormInput
              label="Duration (minutes)"
              type="number"
              placeholder="e.g., 60"
              error={form.formState.errors.durationMinutes?.message}
              {...form.register("durationMinutes", {
                setValueAs: (value) => {
                  if (value === "" || value === null || value === undefined) {
                    return undefined;
                  }
                  const parsed = Number(value);
                  return Number.isNaN(parsed) ? undefined : parsed;
                },
              })}
            />
            <FormInput
              label="Marks Per Question"
              type="number"
              placeholder="Optional"
              error={form.formState.errors.marksPerQuestion?.message}
              {...form.register("marksPerQuestion", {
                setValueAs: (value) => {
                  if (value === "" || value === null || value === undefined) {
                    return undefined;
                  }
                  const parsed = Number(value);
                  return Number.isNaN(parsed) ? undefined : parsed;
                },
              })}
            />
            <FormInput
              label="Negative Marks / Wrong"
              type="number"
              placeholder="e.g., 0.25"
              error={form.formState.errors.negativeMarksPerWrong?.message}
              {...form.register("negativeMarksPerWrong", {
                setValueAs: (value) => {
                  if (value === "" || value === null || value === undefined) {
                    return undefined;
                  }
                  const parsed = Number(value);
                  return Number.isNaN(parsed) ? undefined : parsed;
                },
              })}
            />
          </div>
          <div className="space-y-6">
            <FormSelect
              label="Type"
              value={currentType}
              onChange={(event) => form.setValue("type", event.target.value as TestType)}
            >
              <option value="SUBJECT">Subject</option>
              <option value="COMBINED">Combined</option>
              <option value="CUSTOM">Custom</option>
            </FormSelect>
            <FormSelect
              label="Subject"
              value={selectedSubjectId}
              onChange={(event) => {
                form.setValue("subjectId", event.target.value);
                form.setValue("mixerTopicIds", []);
              }}
            >
              <option value="">Select subject</option>
              {(subjects || []).map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name || subject.title || "Untitled"}
                </option>
              ))}
            </FormSelect>
            <div className="space-y-3">
              <FormInput
                label="Starts At"
                type="datetime-local"
                {...form.register("startsAt")}
              />
              <FormInput
                label="Ends At"
                type="datetime-local"
                {...form.register("endsAt")}
              />
            </div>
            {canPublish ? (
              <Controller
                control={form.control}
                name="isPublished"
                render={({ field }) => (
                  <FormSwitch
                    label="Published"
                    description="Publish immediately to student app."
                    checked={field.value ?? false}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
            ) : null}
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting
            ? "Saving..."
            : isEdit
              ? "Update Test"
              : "Create Test"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.push("/admin/tests")}
        >
          Back to Tests
        </Button>
      </div>
    </form>
  );
}
