"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, type Path } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth/AuthProvider";
import { hasPermission } from "@/lib/auth/permissions";
import { useToast } from "@/modules/shared/components/Toast";
import {
  FormField,
  FormInput,
  FormSelect,
  FormSwitch,
} from "@/modules/shared/components/FormField";
import { MultiSelectField } from "@/modules/shared/components/MultiSelect";
import { Modal } from "@/modules/shared/components/Modal";
import { ErrorState, LoadingState } from "@/modules/shared/components/States";
import { FileUpload } from "@/modules/shared/FileUpload";
import { useSubjects } from "@/modules/taxonomy/subjects/hooks";
import { useTopics } from "@/modules/taxonomy/topics/hooks";
import type { Topic } from "@/modules/taxonomy/topics/types";
import type { QuestionContentBlock, QuestionDetail, QuestionType } from "../types";
import { QuestionFormSchema, type QuestionFormValues } from "../schemas";
import {
  buildContent,
  extractLocalizedContentBlock,
  extractText,
  hasLanguageVariant,
  normalizeOptions,
} from "../utils";
import { getAssetUrl } from "@/lib/api/assets";
import { useCreateQuestion, useQuestion, useUpdateQuestion } from "../hooks";
import { RichTextEditor } from "./RichTextEditor";

const OPTION_LABELS = ["A", "B", "C", "D"];
const LANGUAGE_MODES = [
  {
    value: "ENGLISH" as const,
    label: "English only",
    description: "Store only English content",
  },
  {
    value: "MARATHI" as const,
    label: "Marathi only",
    description: "Store only Marathi content",
  },
  {
    value: "BILINGUAL" as const,
    label: "English + Marathi",
    description: "Store both languages",
  },
];

type LocalizedContentInput = {
  text?: string;
  html?: string;
  imageAssetId?: string;
};

type QuestionLanguageMode = QuestionFormValues["languageMode"];
type LocalizedFieldBase = "statementEn" | "statementMr" | "explanationEn" | "explanationMr";
type LocalizedOptionsBase = "optionsEn" | "optionsMr";

function getTopicName(topic: Topic) {
  return topic.name || topic.title || "Untitled";
}

function createEmptyContent(): LocalizedContentInput {
  return { text: "", html: "", imageAssetId: "" };
}

function createEmptyOptions() {
  return OPTION_LABELS.map(() => createEmptyContent());
}

function detectLanguageMode(question: QuestionDetail): QuestionLanguageMode {
  const hasLegacyMarathiMarker = (value: unknown): boolean => {
    if (!value) return false;
    if (typeof value === "string") {
      return /(font-legacy-marathi|data-question-legacy|shree dev|s0708892|shreelipi)/i.test(
        value
      );
    }
    if (Array.isArray(value)) {
      return value.some((entry) => hasLegacyMarathiMarker(entry));
    }
    if (typeof value !== "object") {
      return false;
    }

    return Object.values(value as Record<string, unknown>).some((entry) =>
      hasLegacyMarathiMarker(entry)
    );
  };

  const mergeLanguageModes = (
    current: QuestionLanguageMode | undefined,
    next: QuestionLanguageMode | undefined
  ): QuestionLanguageMode | undefined => {
    if (!next) return current;
    if (!current || current === next) return next;
    return "BILINGUAL";
  };

  const detectExplicitMode = (value: unknown): QuestionLanguageMode | undefined => {
    if (!value) return undefined;

    if (Array.isArray(value)) {
      return value.reduce<QuestionLanguageMode | undefined>(
        (mode, item) => mergeLanguageModes(mode, detectExplicitMode(item)),
        undefined
      );
    }

    if (typeof value !== "object") return undefined;
    const obj = value as Record<string, unknown>;

    if (obj.languageMode === "ENGLISH" || obj.languageMode === "MARATHI" || obj.languageMode === "BILINGUAL") {
      return obj.languageMode;
    }

    if (obj.primaryLanguage === "mr") return "MARATHI";
    if (obj.primaryLanguage === "en") return "ENGLISH";

    const translations =
      obj.translations && typeof obj.translations === "object"
        ? (obj.translations as Record<string, unknown>)
        : null;
    if (translations) {
      const hasEn = Boolean(translations.en);
      const hasMr = Boolean(translations.mr);
      if (hasEn && hasMr) return "BILINGUAL";
      if (hasMr) return "MARATHI";
      if (hasEn) return "ENGLISH";
    }

    if (Array.isArray(obj.options)) {
      return detectExplicitMode(obj.options);
    }

    return Object.values(obj).reduce<QuestionLanguageMode | undefined>(
      (mode, entry) => mergeLanguageModes(mode, detectExplicitMode(entry)),
      undefined
    );
  };

  const values = [question.statementJson, question.optionsJson, question.explanationJson];
  const explicit = values.reduce<QuestionLanguageMode | undefined>(
    (mode, value) => mergeLanguageModes(mode, detectExplicitMode(value)),
    undefined
  );
  if (explicit) {
    return explicit;
  }

  const hasEnglish = values.some((value) => hasLanguageVariant(value, "en"));
  const hasMarathi = values.some((value) => hasLanguageVariant(value, "mr"));
  const hasLegacyMarathi = values.some((value) => hasLegacyMarathiMarker(value));

  if (hasLegacyMarathi && !hasMarathi) {
    return "MARATHI";
  }

  if (hasEnglish && hasMarathi) return "BILINGUAL";
  if (hasMarathi) return "MARATHI";

  // Legacy data may not carry translation wrappers. Detect Devanagari-heavy content.
  const combinedText = values.map((value) => extractText(value, "en")).join(" ").trim();
  if (combinedText) {
    const devanagariChars = (combinedText.match(/[\u0900-\u097F]/g) || []).length;
    const latinChars = (combinedText.match(/[A-Za-z]/g) || []).length;
    if (devanagariChars > 0 && devanagariChars >= Math.max(4, Math.floor(latinChars * 0.6))) {
      return "MARATHI";
    }
  }

  return "ENGLISH";
}

function mapQuestionToForm(question: QuestionDetail): QuestionFormValues {
  const mode = detectLanguageMode(question);
  const optionsEn =
    mode === "BILINGUAL"
      ? normalizeOptions(question.optionsJson, "en", false)
      : mode === "ENGLISH"
        ? normalizeOptions(question.optionsJson, "en", true)
        : normalizeOptions(undefined, "en", true);
  const optionsMr =
    mode === "BILINGUAL"
      ? normalizeOptions(question.optionsJson, "mr", false)
      : mode === "MARATHI"
        ? normalizeOptions(question.optionsJson, "mr", true)
        : normalizeOptions(undefined, "mr", true);
  const statementEn =
    mode === "BILINGUAL"
      ? extractLocalizedContentBlock(question.statementJson, "en", false)
      : mode === "ENGLISH"
        ? extractLocalizedContentBlock(question.statementJson, "en", true)
        : { text: "", html: "", imageAssetId: undefined };
  const statementMr =
    mode === "BILINGUAL"
      ? extractLocalizedContentBlock(question.statementJson, "mr", false)
      : mode === "MARATHI"
        ? extractLocalizedContentBlock(question.statementJson, "mr", true)
        : { text: "", html: "", imageAssetId: undefined };
  const explanationEn =
    mode === "BILINGUAL"
      ? extractLocalizedContentBlock(question.explanationJson, "en", false)
      : mode === "ENGLISH"
        ? extractLocalizedContentBlock(question.explanationJson, "en", true)
        : { text: "", html: "", imageAssetId: undefined };
  const explanationMr =
    mode === "BILINGUAL"
      ? extractLocalizedContentBlock(question.explanationJson, "mr", false)
      : mode === "MARATHI"
        ? extractLocalizedContentBlock(question.explanationJson, "mr", true)
        : { text: "", html: "", imageAssetId: undefined };
  const correctAnswer = question.correctAnswerJson;

  const values: QuestionFormValues = {
    subjectId: question.subjectId,
    topicId: question.topicId ?? "",
    type: question.type,
    difficulty: question.difficulty ?? undefined,
    languageMode: mode,
    statementEn: {
      text: statementEn.text,
      html: statementEn.html,
      imageAssetId: statementEn.imageAssetId || "",
    },
    statementMr: {
      text: statementMr.text,
      html: statementMr.html,
      imageAssetId: statementMr.imageAssetId || "",
    },
    optionsEn: optionsEn.map((option) => ({
      text: option.text,
      html: option.html || "",
      imageAssetId: option.imageAssetId || "",
    })),
    optionsMr: optionsMr.map((option) => ({
      text: option.text,
      html: option.html || "",
      imageAssetId: option.imageAssetId || "",
    })),
    correctOptionIndex: undefined,
    correctOptionIndexes: [],
    correctBoolean: undefined,
    correctText: "",
    explanationEn: {
      text: explanationEn.text,
      html: explanationEn.html,
      imageAssetId: explanationEn.imageAssetId || "",
    },
    explanationMr: {
      text: explanationMr.text,
      html: explanationMr.html,
      imageAssetId: explanationMr.imageAssetId || "",
    },
    isPublished: question.isPublished,
  };

  if (correctAnswer && typeof correctAnswer === "object") {
    if ("optionIndex" in correctAnswer && typeof correctAnswer.optionIndex === "number") {
      values.correctOptionIndex = correctAnswer.optionIndex;
    }
    if ("optionIndexes" in correctAnswer && Array.isArray(correctAnswer.optionIndexes)) {
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
      return values.correctOptionIndexes?.length
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

function buildLocalizedContent(
  mode: QuestionLanguageMode,
  english: LocalizedContentInput,
  marathi: LocalizedContentInput
): Record<string, unknown> | QuestionContentBlock | undefined {
  const englishContent = buildContent(english.text, english.imageAssetId, english.html);
  const marathiContent = buildContent(marathi.text, marathi.imageAssetId, marathi.html);

  if (mode === "ENGLISH") {
    if (!englishContent) return undefined;
    return {
      ...englishContent,
      languageMode: "ENGLISH",
      primaryLanguage: "en",
    };
  }
  if (mode === "MARATHI") {
    if (!marathiContent) return undefined;
    return {
      ...marathiContent,
      languageMode: "MARATHI",
      primaryLanguage: "mr",
    };
  }

  const translations: Record<string, unknown> = {};
  if (englishContent) translations.en = englishContent;
  if (marathiContent) translations.mr = marathiContent;
  if (!Object.keys(translations).length) return undefined;
  return {
    translations,
    languageMode: "BILINGUAL",
    primaryLanguage: "en",
  };
}

function buildOptions(
  values: QuestionFormValues,
  type: QuestionType
) {
  if (type === "INTEGER" || type === "SHORT_ANSWER") {
    return undefined;
  }

  const englishOptions = values.optionsEn.map((option) =>
    buildContent(option.text, option.imageAssetId, option.html)
  );
  const marathiOptions = values.optionsMr.map((option) =>
    buildContent(option.text, option.imageAssetId, option.html)
  );

  let options: Array<Record<string, unknown> | QuestionContentBlock> = [];

  if (values.languageMode === "ENGLISH") {
    options = englishOptions.map((option) => option ?? { text: "" });
  } else if (values.languageMode === "MARATHI") {
    options = marathiOptions.map((option) => option ?? { text: "" });
  } else {
    options = OPTION_LABELS.map((_, index) => {
      const translations: Record<string, unknown> = {};
      if (englishOptions[index]) translations.en = englishOptions[index];
      if (marathiOptions[index]) translations.mr = marathiOptions[index];
      if (Object.keys(translations).length) {
        return { translations };
      }
      return { text: "" };
    });
  }

  const hasAny = options.some((option) => {
    if (!option || typeof option !== "object") return false;
    const typed = option as Record<string, unknown>;
    if (typed.translations && typeof typed.translations === "object") {
      return Object.values(typed.translations).some((entry) => Boolean(entry));
    }
    return Boolean(
      (typeof typed.text === "string" && typed.text.trim()) ||
        (typeof typed.html === "string" && typed.html.trim()) ||
        (typeof typed.imageAssetId === "string" && typed.imageAssetId.trim())
    );
  });
  if (!hasAny) {
    return undefined;
  }

  return {
    options,
    languageMode: values.languageMode,
    primaryLanguage: values.languageMode === "MARATHI" ? "mr" : "en",
  };
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

  const [previewUrls, setPreviewUrls] = React.useState<Record<string, string | null>>({});
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

  const form = useForm<QuestionFormValues>({
    resolver: zodResolver(QuestionFormSchema),
    defaultValues: {
      subjectId: initialSubjectId ?? "",
      topicId: initialTopicId ?? "",
      type: "SINGLE_CHOICE",
      difficulty: "MEDIUM",
      languageMode: "ENGLISH",
      statementEn: createEmptyContent(),
      statementMr: createEmptyContent(),
      optionsEn: createEmptyOptions(),
      optionsMr: createEmptyOptions(),
      correctOptionIndex: undefined,
      correctOptionIndexes: [],
      correctBoolean: undefined,
      correctText: "",
      explanationEn: createEmptyContent(),
      explanationMr: createEmptyContent(),
      isPublished: false,
    },
  });

  const selectedSubjectId = form.watch("subjectId");
  const { data: topics } = useTopics(selectedSubjectId || undefined);

  const createQuestion = useCreateQuestion();
  const updateQuestion = useUpdateQuestion();

  const setPreviewUrl = React.useCallback((key: string, url: string | null) => {
    setPreviewUrls((prev) => {
      const existing = prev[key];
      if (existing && existing.startsWith("blob:") && existing !== url) {
        URL.revokeObjectURL(existing);
      }
      return { ...prev, [key]: url };
    });
  }, []);

  React.useEffect(() => {
    if (!isEdit && subjects?.length && !form.getValues("subjectId")) {
      form.setValue("subjectId", initialSubjectId ?? subjects[0].id);
    }
  }, [subjects, form, isEdit, initialSubjectId]);

  React.useEffect(() => {
    if (isEdit && question) {
      form.reset(mapQuestionToForm(question));
      setPreviewUrls((prev) => {
        Object.values(prev).forEach((url) => {
          if (url && url.startsWith("blob:")) {
            URL.revokeObjectURL(url);
          }
        });
        return {};
      });
    }
  }, [isEdit, question, form]);

  React.useEffect(() => {
    return () => {
      Object.values(previewUrls).forEach((url) => {
        if (url && url.startsWith("blob:")) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [previewUrls]);

  const getPreviewSrc = React.useCallback(
    (previewKey: string, imageAssetId?: string) =>
      previewUrls[previewKey] || (imageAssetId ? getAssetUrl(imageAssetId) : ""),
    [previewUrls]
  );

  const setLocalizedFieldValue = React.useCallback(
    (
      base: LocalizedFieldBase,
      key: "text" | "html" | "imageAssetId",
      value: string,
      shouldValidate = false
    ) => {
      form.setValue(`${base}.${key}` as Path<QuestionFormValues>, value, {
        shouldDirty: true,
        shouldValidate,
      });
    },
    [form]
  );

  const setOptionFieldValue = React.useCallback(
    (
      base: LocalizedOptionsBase,
      index: number,
      key: "text" | "html" | "imageAssetId",
      value: string
    ) => {
      form.setValue(`${base}.${index}.${key}` as Path<QuestionFormValues>, value, {
        shouldDirty: true,
      });
    },
    [form]
  );

  const handleSubmit = async (values: QuestionFormValues, forcePublish = false) => {
    const sharedStatementImageAssetId =
      values.statementEn.imageAssetId || values.statementMr.imageAssetId || "";
    const sharedExplanationImageAssetId =
      values.explanationEn.imageAssetId || values.explanationMr.imageAssetId || "";
    const sharedOptionImageAssetIds = OPTION_LABELS.map((_, index) => {
      return values.optionsEn[index]?.imageAssetId || values.optionsMr[index]?.imageAssetId || "";
    });

    const normalizedValues: QuestionFormValues = {
      ...values,
      statementEn: {
        ...values.statementEn,
        imageAssetId: sharedStatementImageAssetId,
      },
      statementMr: {
        ...values.statementMr,
        imageAssetId: sharedStatementImageAssetId,
      },
      explanationEn: {
        ...values.explanationEn,
        imageAssetId: sharedExplanationImageAssetId,
      },
      explanationMr: {
        ...values.explanationMr,
        imageAssetId: sharedExplanationImageAssetId,
      },
      optionsEn: values.optionsEn.map((option, index) => ({
        ...option,
        imageAssetId: sharedOptionImageAssetIds[index],
      })),
      optionsMr: values.optionsMr.map((option, index) => ({
        ...option,
        imageAssetId: sharedOptionImageAssetIds[index],
      })),
    };

    const statementJson =
      buildLocalizedContent(
        normalizedValues.languageMode,
        normalizedValues.statementEn,
        normalizedValues.statementMr
      ) ??
      buildContent(
        normalizedValues.statementEn.text,
        normalizedValues.statementEn.imageAssetId,
        normalizedValues.statementEn.html
      ) ??
      buildContent(
        normalizedValues.statementMr.text,
        normalizedValues.statementMr.imageAssetId,
        normalizedValues.statementMr.html
      );

    if (!statementJson) {
      toast({
        title: "Save failed",
        description: "Question statement is required.",
        variant: "destructive",
      });
      return;
    }

    const payload = {
      subjectId: normalizedValues.subjectId,
      topicId: normalizedValues.topicId || undefined,
      type: normalizedValues.type,
      difficulty: normalizedValues.difficulty || undefined,
      statementJson,
      optionsJson: buildOptions(normalizedValues, normalizedValues.type),
      explanationJson: buildLocalizedContent(
        normalizedValues.languageMode,
        normalizedValues.explanationEn,
        normalizedValues.explanationMr
      ),
      correctAnswerJson: buildCorrectAnswer(normalizedValues),
      isPublished: forcePublish ? true : normalizedValues.isPublished ?? false,
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
  const languageMode = form.watch("languageMode");
  const showEnglish = languageMode !== "MARATHI";
  const showMarathi = languageMode !== "ENGLISH";
  const correctOptionIndex = form.watch("correctOptionIndex");
  const correctOptionIndexes = form.watch("correctOptionIndexes") || [];

  const languagesToRender = [
    {
      key: "en" as const,
      label: "English",
      statementBase: "statementEn" as const,
      optionsBase: "optionsEn" as const,
      explanationBase: "explanationEn" as const,
      visible: showEnglish,
      statementError: form.formState.errors.statementEn?.text?.message,
      optionsError: form.formState.errors.optionsEn?.message,
    },
    {
      key: "mr" as const,
      label: "Marathi",
      statementBase: "statementMr" as const,
      optionsBase: "optionsMr" as const,
      explanationBase: "explanationMr" as const,
      visible: showMarathi,
      statementError: form.formState.errors.statementMr?.text?.message,
      optionsError: form.formState.errors.optionsMr?.message,
    },
  ].filter((item) => item.visible);

  const openPreview = (src: string, title: string) => {
    setPreviewSrc(src);
    setPreviewTitle(title);
    setPreviewOpen(true);
  };

  const statementImageAssetId =
    form.watch("statementEn.imageAssetId") || form.watch("statementMr.imageAssetId") || "";
  const explanationImageAssetId =
    form.watch("explanationEn.imageAssetId") || form.watch("explanationMr.imageAssetId") || "";

  const setSharedStatementImage = (imageAssetId: string) => {
    setLocalizedFieldValue("statementEn", "imageAssetId", imageAssetId);
    setLocalizedFieldValue("statementMr", "imageAssetId", imageAssetId);
  };

  const setSharedExplanationImage = (imageAssetId: string) => {
    setLocalizedFieldValue("explanationEn", "imageAssetId", imageAssetId);
    setLocalizedFieldValue("explanationMr", "imageAssetId", imageAssetId);
  };

  const setSharedOptionImage = (index: number, imageAssetId: string) => {
    setOptionFieldValue("optionsEn", index, "imageAssetId", imageAssetId);
    setOptionFieldValue("optionsMr", index, "imageAssetId", imageAssetId);
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
            {languagesToRender.map((languageSection) => {
              const statement = form.watch(languageSection.statementBase);
              const explanation = form.watch(languageSection.explanationBase);

              return (
                <div key={languageSection.key} className="space-y-6 rounded-2xl border border-border bg-card/40 p-4">
                  <div className="flex items-center justify-between border-b border-border pb-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                        Question Content
                      </p>
                      <h3 className="text-sm font-semibold text-foreground">
                        {languageSection.label}
                      </h3>
                    </div>
                  </div>

                  <RichTextEditor
                    label={`Statement (${languageSection.label})`}
                    description="Use toolbar to format text, add tables, and insert equations."
                    error={languageSection.statementError}
                    value={statement?.html || ""}
                    language={languageSection.key}
                    placeholder={`Enter statement in ${languageSection.label}`}
                    onChange={(html, text) => {
                      setLocalizedFieldValue(languageSection.statementBase, "html", html, true);
                      setLocalizedFieldValue(languageSection.statementBase, "text", text, true);
                    }}
                  />

                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-semibold text-foreground">
                        Options ({languageSection.label})
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        Add option text, equations, tables, and optional images.
                      </p>
                      {languageSection.optionsError ? (
                        <p className="mt-1 text-xs text-destructive">
                          {languageSection.optionsError}
                        </p>
                      ) : null}
                    </div>
                    <div className="space-y-4">
                      {OPTION_LABELS.map((label, index) => {
                        const option = form.watch(
                          `${languageSection.optionsBase}.${index}` as Path<QuestionFormValues>
                        ) as LocalizedContentInput;

                        return (
                          <div
                            key={`${languageSection.key}-${label}`}
                            className="rounded-2xl border border-border bg-card/70 p-3"
                          >
                            <RichTextEditor
                              label={`Option ${label} (${languageSection.label})`}
                              compact
                              value={option?.html || ""}
                              language={languageSection.key}
                              placeholder={`Option ${label} in ${languageSection.label}`}
                              onChange={(html, text) => {
                                setOptionFieldValue(languageSection.optionsBase, index, "html", html);
                                setOptionFieldValue(languageSection.optionsBase, index, "text", text);
                              }}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <RichTextEditor
                    label={`Explanation (${languageSection.label})`}
                    description="Optional explanation shown after answer submission."
                    value={explanation?.html || ""}
                    language={languageSection.key}
                    placeholder={`Optional explanation in ${languageSection.label}`}
                    onChange={(html, text) => {
                      setLocalizedFieldValue(languageSection.explanationBase, "html", html);
                      setLocalizedFieldValue(languageSection.explanationBase, "text", text);
                    }}
                  />
                </div>
              );
            })}

            <FormField
              label="Statement Image (Shared)"
              description="Upload once. The same statement image is used for English and Marathi."
            >
              <FileUpload
                purpose="QUESTION_IMAGE"
                accept="image/*"
                onComplete={(file) => {
                  setSharedStatementImage(file.fileAssetId);
                  setPreviewUrl("statement-shared-image", file.previewUrl ?? null);
                }}
              />
              {getPreviewSrc("statement-shared-image", statementImageAssetId) ? (
                <div className="mt-3 space-y-2">
                  <button
                    type="button"
                    className="w-full"
                    onClick={() =>
                      openPreview(
                        getPreviewSrc("statement-shared-image", statementImageAssetId),
                        "Statement Image"
                      )
                    }
                  >
                    <img
                      src={getPreviewSrc("statement-shared-image", statementImageAssetId)}
                      alt="Statement"
                      className="max-h-48 w-full rounded-2xl border border-border object-contain"
                    />
                  </button>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSharedStatementImage("");
                        setPreviewUrl("statement-shared-image", null);
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
                          getPreviewSrc("statement-shared-image", statementImageAssetId),
                          "Statement Image"
                        )
                      }
                    >
                      View larger
                    </Button>
                  </div>
                </div>
              ) : null}
            </FormField>

            {currentType === "SINGLE_CHOICE" ||
            currentType === "MULTI_CHOICE" ||
            currentType === "TRUE_FALSE" ? (
              <div className="space-y-4 rounded-2xl border border-border bg-card/40 p-4">
                <div>
                  <h4 className="text-sm font-semibold text-foreground">Option Images (Shared)</h4>
                  <p className="text-xs text-muted-foreground">
                    Upload each option image once. The same image is reused in both languages.
                  </p>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  {OPTION_LABELS.map((label, index) => {
                    const previewKey = `option-shared-${index}-image`;
                    const optionImageAssetId =
                      form.watch(`optionsEn.${index}.imageAssetId`) ||
                      form.watch(`optionsMr.${index}.imageAssetId`) ||
                      "";
                    const previewSrc = getPreviewSrc(previewKey, optionImageAssetId);

                    return (
                      <FormField
                        key={`option-shared-image-${label}`}
                        label={`Option ${label} Image`}
                        description="Shared across English and Marathi."
                      >
                        <FileUpload
                          purpose="OPTION_IMAGE"
                          accept="image/*"
                          onComplete={(file) => {
                            setSharedOptionImage(index, file.fileAssetId);
                            setPreviewUrl(previewKey, file.previewUrl ?? null);
                          }}
                        />
                        {previewSrc ? (
                          <div className="mt-2 space-y-2">
                            <button
                              type="button"
                              className="w-full"
                              onClick={() => openPreview(previewSrc, `Option ${label} Image`)}
                            >
                              <img
                                src={previewSrc}
                                alt={`Option ${label}`}
                                className="max-h-40 w-full rounded-2xl border border-border object-contain"
                              />
                            </button>
                            <div className="flex flex-wrap gap-2">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSharedOptionImage(index, "");
                                  setPreviewUrl(previewKey, null);
                                }}
                              >
                                Remove image
                              </Button>
                              <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                onClick={() => openPreview(previewSrc, `Option ${label} Image`)}
                              >
                                View larger
                              </Button>
                            </div>
                          </div>
                        ) : null}
                      </FormField>
                    );
                  })}
                </div>
              </div>
            ) : null}

            <FormField
              label="Explanation Image (Shared)"
              description="Upload once. The same explanation image is used for English and Marathi."
            >
              <FileUpload
                purpose="EXPLANATION_IMAGE"
                accept="image/*"
                onComplete={(file) => {
                  setSharedExplanationImage(file.fileAssetId);
                  setPreviewUrl("explanation-shared-image", file.previewUrl ?? null);
                }}
              />
              {getPreviewSrc("explanation-shared-image", explanationImageAssetId) ? (
                <div className="mt-3 space-y-2">
                  <button
                    type="button"
                    className="w-full"
                    onClick={() =>
                      openPreview(
                        getPreviewSrc("explanation-shared-image", explanationImageAssetId),
                        "Explanation Image"
                      )
                    }
                  >
                    <img
                      src={getPreviewSrc("explanation-shared-image", explanationImageAssetId)}
                      alt="Explanation"
                      className="max-h-48 w-full rounded-2xl border border-border object-contain"
                    />
                  </button>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSharedExplanationImage("");
                        setPreviewUrl("explanation-shared-image", null);
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
                          getPreviewSrc("explanation-shared-image", explanationImageAssetId),
                          "Explanation Image"
                        )
                      }
                    >
                      View larger
                    </Button>
                  </div>
                </div>
              ) : null}
            </FormField>

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
          </div>

          <div className="space-y-6">
            <FormField
              label="Question Languages"
              description="Choose whether admin enters English, Marathi, or both."
            >
              <div className="grid gap-2">
                {LANGUAGE_MODES.map((mode) => (
                  <button
                    key={mode.value}
                    type="button"
                    onClick={() => form.setValue("languageMode", mode.value)}
                    className={`rounded-2xl border px-3 py-2 text-left text-sm transition ${
                      languageMode === mode.value
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-background text-foreground hover:bg-muted/60"
                    }`}
                  >
                    <p className="font-medium">{mode.label}</p>
                    <p className="text-xs text-muted-foreground">{mode.description}</p>
                  </button>
                ))}
              </div>
            </FormField>

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
                  event.target.value
                    ? (event.target.value as QuestionFormValues["difficulty"])
                    : undefined
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
