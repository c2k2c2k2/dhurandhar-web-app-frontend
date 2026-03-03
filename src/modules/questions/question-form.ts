"use client";

import type { QuestionCreateInput, QuestionContentBlock, QuestionItem, QuestionType } from "./types";
import type { QuestionFormValues } from "./schemas";
import { buildContent } from "./utils";

export const QUESTION_OPTION_LABELS = ["A", "B", "C", "D"] as const;

export function sortQuestionOptionIndexes(indexes: number[] | undefined) {
  if (!indexes?.length) {
    return [];
  }

  return Array.from(new Set(indexes.filter((index) => Number.isInteger(index)))).sort(
    (left, right) => left - right
  );
}

export function normalizeQuestionFormValues(values: QuestionFormValues): QuestionFormValues {
  const sharedStatementImageAssetId =
    values.statementEn.imageAssetId || values.statementMr.imageAssetId || "";
  const sharedExplanationImageAssetId =
    values.explanationEn.imageAssetId || values.explanationMr.imageAssetId || "";
  const sharedOptionImageAssetIds = QUESTION_OPTION_LABELS.map((_, index) => {
    return values.optionsEn[index]?.imageAssetId || values.optionsMr[index]?.imageAssetId || "";
  });

  return {
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
    correctOptionIndexes: sortQuestionOptionIndexes(values.correctOptionIndexes),
  };
}

export function buildCorrectAnswer(values: QuestionFormValues) {
  switch (values.type) {
    case "SINGLE_CHOICE":
      return typeof values.correctOptionIndex === "number"
        ? { optionIndex: values.correctOptionIndex }
        : undefined;
    case "MULTI_CHOICE":
      return values.correctOptionIndexes?.length
        ? { optionIndexes: sortQuestionOptionIndexes(values.correctOptionIndexes) }
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

export function buildLocalizedContent(
  mode: QuestionFormValues["languageMode"],
  english: QuestionFormValues["statementEn"],
  marathi: QuestionFormValues["statementMr"]
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

export function buildOptions(values: QuestionFormValues, type: QuestionType) {
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
    options = QUESTION_OPTION_LABELS.map((_, index) => {
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

export function buildQuestionPayload(values: QuestionFormValues): QuestionCreateInput | null {
  const normalizedValues = normalizeQuestionFormValues(values);

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
    return null;
  }

  return {
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
    isPublished: normalizedValues.isPublished ?? false,
  };
}

export function buildQuestionPreviewItem(values: QuestionFormValues): QuestionItem {
  const normalizedValues = normalizeQuestionFormValues(values);
  const payload = buildQuestionPayload(normalizedValues);

  return {
    id: "preview-question",
    subjectId: normalizedValues.subjectId || "preview-subject",
    topicId: normalizedValues.topicId || undefined,
    type: normalizedValues.type,
    difficulty: normalizedValues.difficulty ?? null,
    statementJson:
      payload?.statementJson ??
      buildLocalizedContent(
        normalizedValues.languageMode,
        normalizedValues.statementEn,
        normalizedValues.statementMr
      ) ??
      { text: "" },
    optionsJson: payload?.optionsJson ?? buildOptions(normalizedValues, normalizedValues.type),
    explanationJson:
      payload?.explanationJson ??
      buildLocalizedContent(
        normalizedValues.languageMode,
        normalizedValues.explanationEn,
        normalizedValues.explanationMr
      ),
    correctAnswerJson: payload?.correctAnswerJson ?? buildCorrectAnswer(normalizedValues),
    isPublished: normalizedValues.isPublished ?? false,
  };
}
