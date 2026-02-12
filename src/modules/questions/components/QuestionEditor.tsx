"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Modal } from "@/modules/shared/components/Modal";
import { ErrorState, LoadingState } from "@/modules/shared/components/States";
import { FileUpload } from "@/modules/shared/FileUpload";
import { useSubjects } from "@/modules/taxonomy/subjects/hooks";
import { useTopics } from "@/modules/taxonomy/topics/hooks";
import type { Topic } from "@/modules/taxonomy/topics/types";
import type { QuestionDetail, QuestionType } from "../types";
import { QuestionFormSchema, type QuestionFormValues } from "../schemas";
import { buildContent, extractImageAssetId, extractText, normalizeOptions } from "../utils";
import { getAssetUrl } from "@/lib/api/assets";
import { useCreateQuestion, useQuestion, useUpdateQuestion } from "../hooks";

const OPTION_LABELS = ["A", "B", "C", "D"];

function getTopicName(topic: Topic) {
  return topic.name || topic.title || "Untitled";
}

function mapQuestionToForm(question: QuestionDetail): QuestionFormValues {
  const options = normalizeOptions(question.optionsJson);
  const correctAnswer = question.correctAnswerJson;

  const values: QuestionFormValues = {
    subjectId: question.subjectId,
    topicId: question.topicId ?? "",
    type: question.type,
    difficulty: question.difficulty ?? undefined,
    statementText: extractText(question.statementJson),
    statementImageAssetId: extractImageAssetId(question.statementJson),
    options,
    correctOptionIndex: undefined,
    correctOptionIndexes: [],
    correctBoolean: undefined,
    correctText: "",
    explanationText: extractText(question.explanationJson),
    explanationImageAssetId: extractImageAssetId(question.explanationJson),
    isPublished: question.isPublished,
  };

  if (correctAnswer && typeof correctAnswer === "object") {
    if ("optionIndex" in correctAnswer && typeof correctAnswer.optionIndex === "number") {
      values.correctOptionIndex = correctAnswer.optionIndex;
    }
    if (
      "optionIndexes" in correctAnswer &&
      Array.isArray(correctAnswer.optionIndexes)
    ) {
      values.correctOptionIndexes = correctAnswer.optionIndexes.filter(
        (index): index is number => typeof index === "number"
      );
    }
    if ("value" in correctAnswer) {
      if (typeof correctAnswer.value === "boolean") {
        values.correctBoolean = correctAnswer.value ? "true" : "false";
      } else if (typeof correctAnswer.value === "number") {
        values.correctText = String(correctAnswer.value);
      } else if (typeof correctAnswer.value === "string") {
        values.correctText = correctAnswer.value;
      }
    }
  }

  if (typeof correctAnswer === "string" || typeof correctAnswer === "number") {
    values.correctText = String(correctAnswer);
  }

  return values;
}

function buildCorrectAnswer(values: QuestionFormValues) {
  switch (values.type) {
    case "SINGLE_CHOICE":
      return typeof values.correctOptionIndex === "number"
        ? { optionIndex: values.correctOptionIndex }
        : undefined;
    case "MULTI_CHOICE":
      return values.correctOptionIndexes && values.correctOptionIndexes.length
        ? { optionIndexes: values.correctOptionIndexes }
        : undefined;
    case "TRUE_FALSE":
      return values.correctBoolean
        ? { value: values.correctBoolean === "true" }
        : undefined;
    case "INTEGER": {
      const trimmed = values.correctText?.trim();
      if (!trimmed) return undefined;
      const numeric = Number(trimmed);
      return { value: Number.isNaN(numeric) ? trimmed : numeric };
    }
    case "SHORT_ANSWER": {
      const trimmed = values.correctText?.trim();
      return trimmed ? { value: trimmed } : undefined;
    }
    default:
      return undefined;
  }
}

function buildOptions(values: QuestionFormValues, type: QuestionType) {
  if (type === "INTEGER" || type === "SHORT_ANSWER") {
    return undefined;
  }

  const options = values.options.map((option) => {
    const content = buildContent(option.text, option.imageAssetId);
    return content ?? { text: "" };
  });

  const hasAny = options.some(
    (option) => Boolean(option.text || option.imageAssetId || option.assetId)
  );

  return hasAny ? { options } : undefined;
}

export function QuestionEditor({
  questionId,
  initialSubjectId,
  initialTopicId,
}: {
  questionId?: string;
  initialSubjectId?: string;
  initialTopicId?: string;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const canPublish = hasPermission(user, "questions.publish");
  const isEdit = Boolean(questionId);
  const [statementPreviewUrl, setStatementPreviewUrl] = React.useState<string | null>(null);
  const [explanationPreviewUrl, setExplanationPreviewUrl] = React.useState<string | null>(null);
  const [optionPreviewUrls, setOptionPreviewUrls] = React.useState<(string | null)[]>(
    () => OPTION_LABELS.map(() => null)
  );
  const previewUrlsRef = React.useRef<{
    statement: string | null;
    explanation: string | null;
    options: (string | null)[];
  }>({
    statement: null,
    explanation: null,
    options: OPTION_LABELS.map(() => null),
  });
  const [previewOpen, setPreviewOpen] = React.useState(false);
  const [previewTitle, setPreviewTitle] = React.useState("Preview");
  const [previewSrc, setPreviewSrc] = React.useState<string | null>(null);

  const {
    data: question,
    isLoading: questionLoading,
    error: questionError,
  } = useQuestion(questionId);

  const {
    data: subjects,
    isLoading: subjectsLoading,
    error: subjectsError,
  } = useSubjects();

  const defaultOptions = React.useMemo(
    () => OPTION_LABELS.map(() => ({ text: "", imageAssetId: "" })),
    []
  );

  const form = useForm<QuestionFormValues>({
    resolver: zodResolver(QuestionFormSchema),
    defaultValues: {
      subjectId: initialSubjectId ?? "",
      topicId: initialTopicId ?? "",
      type: "SINGLE_CHOICE",
      difficulty: "MEDIUM",
      statementText: "",
      statementImageAssetId: "",
      options: defaultOptions,
      correctOptionIndex: undefined,
      correctOptionIndexes: [],
      correctBoolean: undefined,
      correctText: "",
      explanationText: "",
      explanationImageAssetId: "",
      isPublished: false,
    },
  });

  const selectedSubjectId = form.watch("subjectId");
  const { data: topics } = useTopics(selectedSubjectId || undefined);

  const createQuestion = useCreateQuestion();
  const updateQuestion = useUpdateQuestion();

  React.useEffect(() => {
    if (!isEdit && subjects && subjects.length && !form.getValues("subjectId")) {
      form.setValue("subjectId", initialSubjectId ?? subjects[0].id);
    }
  }, [subjects, form, isEdit, initialSubjectId]);

  React.useEffect(() => {
    if (isEdit && question) {
      form.reset(mapQuestionToForm(question));
      setStatementPreviewUrl((prev) => {
        if (prev && prev.startsWith("blob:")) {
          URL.revokeObjectURL(prev);
        }
        return null;
      });
      setExplanationPreviewUrl((prev) => {
        if (prev && prev.startsWith("blob:")) {
          URL.revokeObjectURL(prev);
        }
        return null;
      });
      setOptionPreviewUrls((prev) => {
        prev.forEach((url) => {
          if (url && url.startsWith("blob:")) {
            URL.revokeObjectURL(url);
          }
        });
        return OPTION_LABELS.map(() => null);
      });
    }
  }, [isEdit, question, form]);

  React.useEffect(() => {
    previewUrlsRef.current = {
      statement: statementPreviewUrl,
      explanation: explanationPreviewUrl,
      options: optionPreviewUrls,
    };
  }, [statementPreviewUrl, explanationPreviewUrl, optionPreviewUrls]);

  React.useEffect(() => {
    return () => {
      const current = previewUrlsRef.current;
      if (current.statement && current.statement.startsWith("blob:")) {
        URL.revokeObjectURL(current.statement);
      }
      if (current.explanation && current.explanation.startsWith("blob:")) {
        URL.revokeObjectURL(current.explanation);
      }
      current.options.forEach((url) => {
        if (url && url.startsWith("blob:")) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, []);

  const handleSubmit = async (values: QuestionFormValues, forcePublish = false) => {
    const statement = buildContent(values.statementText, values.statementImageAssetId);
    const explanation = buildContent(
      values.explanationText,
      values.explanationImageAssetId
    );

    const payload = {
      subjectId: values.subjectId,
      topicId: values.topicId || undefined,
      type: values.type,
      difficulty: values.difficulty || undefined,
      statementJson: statement ?? { text: values.statementText },
      optionsJson: buildOptions(values, values.type),
      explanationJson: explanation || undefined,
      correctAnswerJson: buildCorrectAnswer(values),
      isPublished: forcePublish ? true : values.isPublished ?? false,
    };

    try {
      if (isEdit && questionId) {
        await updateQuestion.mutateAsync({ questionId, input: payload });
        toast({ title: "Question updated" });
      } else {
        const created = await createQuestion.mutateAsync(payload);
        toast({ title: "Question created" });
        router.replace(`/admin/questions/${created.id}`);
      }
    } catch (err) {
      toast({
        title: "Save failed",
        description:
          err && typeof err === "object" && "message" in err
            ? String(err.message)
            : "Unable to save question.",
        variant: "destructive",
      });
    }
  };

  if (isEdit && questionLoading) {
    return <LoadingState label="Loading question..." />;
  }

  if (isEdit && questionError) {
    return (
      <ErrorState
        description={
          questionError && typeof questionError === "object" && "message" in questionError
            ? String(questionError.message)
            : "Unable to load question."
        }
      />
    );
  }

  if (isEdit && !question) {
    return <ErrorState description="Question not found." />;
  }

  const subjectOptions = subjects || [];
  const topicOptions = topics || [];
  const currentType = form.watch("type");
  const correctOptionIndex = form.watch("correctOptionIndex");
  const correctOptionIndexes = form.watch("correctOptionIndexes") || [];
  const statementImageAssetId = form.watch("statementImageAssetId");
  const explanationImageAssetId = form.watch("explanationImageAssetId");
  const statementPreviewSrc =
    statementPreviewUrl ||
    (statementImageAssetId ? getAssetUrl(statementImageAssetId) : "");
  const explanationPreviewSrc =
    explanationPreviewUrl ||
    (explanationImageAssetId ? getAssetUrl(explanationImageAssetId) : "");

  const openPreview = (src: string, title: string) => {
    setPreviewSrc(src);
    setPreviewTitle(title);
    setPreviewOpen(true);
  };

  return (
    <form className="space-y-6" onSubmit={form.handleSubmit((values) => handleSubmit(values))}>
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
            <FormTextarea
              label="Statement"
              placeholder="Enter the question statement"
              error={form.formState.errors.statementText?.message}
              {...form.register("statementText")}
            />
            <FormField
              label="Statement Image"
              description="Optional image for the statement."
            >
              <FileUpload
                purpose="QUESTION_IMAGE"
                accept="image/*"
                onComplete={(file) => {
                  form.setValue("statementImageAssetId", file.fileAssetId);
                  setStatementPreviewUrl((prev) => {
                    if (prev && prev.startsWith("blob:")) {
                      URL.revokeObjectURL(prev);
                    }
                    return file.previewUrl ?? null;
                  });
                }}
              />
              {statementPreviewSrc ? (
                <div className="mt-3 space-y-2">
                  <button
                    type="button"
                    className="w-full"
                    onClick={() => openPreview(statementPreviewSrc, "Statement Image")}
                  >
                    <img
                      src={statementPreviewSrc}
                      alt="Statement"
                      className="max-h-40 w-full rounded-2xl border border-border object-contain"
                    />
                  </button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      form.setValue("statementImageAssetId", "");
                      setStatementPreviewUrl((prev) => {
                        if (prev && prev.startsWith("blob:")) {
                          URL.revokeObjectURL(prev);
                        }
                        return null;
                      });
                    }}
                  >
                    Remove image
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => openPreview(statementPreviewSrc, "Statement Image")}
                  >
                    View larger
                  </Button>
                </div>
              ) : null}
            </FormField>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-foreground">Options</h3>
                <p className="text-xs text-muted-foreground">
                  Provide up to four options with optional images.
                </p>
              </div>
              <div className="space-y-4">
                {OPTION_LABELS.map((label, index) => {
                  const imageField = `options.${index}.imageAssetId` as const;
                  const textField = `options.${index}.text` as const;
                  const optionImageAssetId = form.watch(imageField);
                  return (
                    <FormField key={label} label={`Option ${label}`}>
                      <div className="space-y-3">
                        <Input
                          placeholder={`Option ${label} text`}
                          {...form.register(textField)}
                        />
                        <FileUpload
                          purpose="OPTION_IMAGE"
                          accept="image/*"
                          onComplete={(file) => {
                            form.setValue(imageField, file.fileAssetId);
                            setOptionPreviewUrls((prev) => {
                              const next = [...prev];
                              const existing = next[index];
                              if (existing && existing.startsWith("blob:")) {
                                URL.revokeObjectURL(existing);
                              }
                              next[index] = file.previewUrl ?? null;
                              return next;
                            });
                          }}
                        />
                        {optionPreviewUrls[index] || optionImageAssetId ? (
                          <div className="mt-2 space-y-2">
                            <button
                              type="button"
                              className="w-full"
                              onClick={() =>
                                openPreview(
                                  optionPreviewUrls[index] ||
                                    (optionImageAssetId
                                      ? getAssetUrl(optionImageAssetId)
                                      : ""),
                                  `Option ${label} Image`
                                )
                              }
                            >
                              <img
                                src={
                                  optionPreviewUrls[index] ||
                                  (optionImageAssetId
                                    ? getAssetUrl(optionImageAssetId)
                                    : "")
                                }
                                alt={`Option ${label}`}
                                className="max-h-32 w-full rounded-2xl border border-border object-contain"
                              />
                            </button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                form.setValue(imageField, "");
                                setOptionPreviewUrls((prev) => {
                                  const next = [...prev];
                                  const existing = next[index];
                                  if (existing && existing.startsWith("blob:")) {
                                    URL.revokeObjectURL(existing);
                                  }
                                  next[index] = null;
                                  return next;
                                });
                              }}
                            >
                              Remove image
                            </Button>
                            <Button
                              type="button"
                              variant="secondary"
                              size="sm"
                              onClick={() =>
                                openPreview(
                                  optionPreviewUrls[index] ||
                                    (optionImageAssetId
                                      ? getAssetUrl(optionImageAssetId)
                                      : ""),
                                  `Option ${label} Image`
                                )
                              }
                            >
                              View larger
                            </Button>
                          </div>
                        ) : null}
                      </div>
                    </FormField>
                  );
                })}
              </div>
            </div>

            {currentType === "MULTI_CHOICE" ? (
              <MultiSelectField
                label="Correct Answers"
                description="Select all correct options."
                items={OPTION_LABELS.map((label, index) => ({
                  id: String(index),
                  label: `Option ${label}`,
                }))}
                value={correctOptionIndexes.map(String)}
                onChange={(next) =>
                  form.setValue(
                    "correctOptionIndexes",
                    next.map((value) => Number(value))
                  )
                }
                emptyLabel="Add options to select answers."
                searchPlaceholder="Search options..."
                modalTitle="Select correct answers"
                selectLabel="Select answers"
                editLabel="Edit answers"
              />
            ) : currentType === "TRUE_FALSE" ? (
              <FormSelect
                label="Correct Answer"
                value={form.watch("correctBoolean") || ""}
                onChange={(event) =>
                  form.setValue(
                    "correctBoolean",
                    event.target.value ? (event.target.value as "true" | "false") : undefined
                  )
                }
              >
                <option value="">Select answer</option>
                <option value="true">True</option>
                <option value="false">False</option>
              </FormSelect>
            ) : currentType === "INTEGER" || currentType === "SHORT_ANSWER" ? (
              <FormInput
                label="Correct Answer"
                placeholder="Enter the correct answer"
                {...form.register("correctText")}
              />
            ) : (
              <FormSelect
                label="Correct Answer"
                value={
                  typeof correctOptionIndex === "number"
                    ? String(correctOptionIndex)
                    : ""
                }
                onChange={(event) =>
                  form.setValue(
                    "correctOptionIndex",
                    event.target.value === ""
                      ? undefined
                      : Number(event.target.value)
                  )
                }
              >
                <option value="">Select answer</option>
                {OPTION_LABELS.map((label, index) => (
                  <option key={label} value={index}>
                    Option {label}
                  </option>
                ))}
              </FormSelect>
            )}

            <FormTextarea
              label="Explanation"
              placeholder="Optional explanation"
              error={form.formState.errors.explanationText?.message}
              {...form.register("explanationText")}
            />
            <FormField
              label="Explanation Image"
              description="Optional image for the explanation."
            >
              <FileUpload
                purpose="EXPLANATION_IMAGE"
                accept="image/*"
                onComplete={(file) => {
                  form.setValue("explanationImageAssetId", file.fileAssetId);
                  setExplanationPreviewUrl((prev) => {
                    if (prev && prev.startsWith("blob:")) {
                      URL.revokeObjectURL(prev);
                    }
                    return file.previewUrl ?? null;
                  });
                }}
              />
              {explanationPreviewSrc ? (
                <div className="mt-3 space-y-2">
                  <button
                    type="button"
                    className="w-full"
                    onClick={() =>
                      openPreview(explanationPreviewSrc, "Explanation Image")
                    }
                  >
                    <img
                      src={explanationPreviewSrc}
                      alt="Explanation"
                      className="max-h-40 w-full rounded-2xl border border-border object-contain"
                    />
                  </button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      form.setValue("explanationImageAssetId", "");
                      setExplanationPreviewUrl((prev) => {
                        if (prev && prev.startsWith("blob:")) {
                          URL.revokeObjectURL(prev);
                        }
                        return null;
                      });
                    }}
                  >
                    Remove image
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() =>
                      openPreview(explanationPreviewSrc, "Explanation Image")
                    }
                  >
                    View larger
                  </Button>
                </div>
              ) : null}
            </FormField>
          </div>
          <div className="space-y-6">
            <FormSelect
              label="Subject"
              value={selectedSubjectId}
              onChange={(event) => {
                form.setValue("subjectId", event.target.value);
                form.setValue("topicId", "");
              }}
            >
              <option value="">Select subject</option>
              {subjectOptions.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name || subject.title || "Untitled"}
                </option>
              ))}
            </FormSelect>
            <FormSelect
              label="Topic"
              value={form.watch("topicId") || ""}
              onChange={(event) => form.setValue("topicId", event.target.value)}
              disabled={!selectedSubjectId}
            >
              <option value="">Optional topic</option>
              {topicOptions.map((topic) => (
                <option key={topic.id} value={topic.id}>
                  {getTopicName(topic)}
                </option>
              ))}
            </FormSelect>
            <FormSelect
              label="Difficulty"
              value={form.watch("difficulty") || ""}
              onChange={(event) =>
                form.setValue(
                  "difficulty",
                  event.target.value ? (event.target.value as QuestionFormValues["difficulty"]) : undefined
                )
              }
            >
              <option value="">Default (Medium)</option>
              <option value="EASY">Easy</option>
              <option value="MEDIUM">Medium</option>
              <option value="HARD">Hard</option>
            </FormSelect>
            <FormSelect
              label="Type"
              value={currentType}
              onChange={(event) =>
                form.setValue("type", event.target.value as QuestionType)
              }
            >
              <option value="SINGLE_CHOICE">Single choice</option>
              <option value="MULTI_CHOICE">Multiple choice</option>
              <option value="TRUE_FALSE">True/False</option>
              <option value="INTEGER">Integer</option>
              <option value="SHORT_ANSWER">Short answer</option>
            </FormSelect>
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
              ? "Update Question"
              : "Create Question"}
        </Button>
        {!isEdit && canPublish ? (
          <Button
            type="button"
            variant="secondary"
            disabled={form.formState.isSubmitting}
            onClick={form.handleSubmit((values) => handleSubmit(values, true))}
          >
            Save & Publish
          </Button>
        ) : null}
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.push("/admin/questions")}
        >
          Back to Questions
        </Button>
      </div>
      <Modal
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        title={previewTitle}
        description="Preview the uploaded image."
        className="max-w-5xl"
      >
        {previewSrc ? (
          <img
            src={previewSrc}
            alt={previewTitle}
            className="max-h-[75vh] w-full rounded-2xl border border-border object-contain"
          />
        ) : (
          <p className="text-sm text-muted-foreground">Preview unavailable.</p>
        )}
      </Modal>
    </form>
  );
}
