"use client";

import * as React from "react";
import {
  AlertCircle,
  CheckCircle2,
  CheckSquare2,
  Circle,
  RotateCcw,
  Square,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { getAssetUrl } from "@/lib/api/assets";
import type { AnswerValue } from "@/modules/student-questions/types";
import { Modal } from "@/modules/shared/components/Modal";
import type { QuestionFormValues } from "../schemas";
import { buildQuestionPreviewItem, QUESTION_OPTION_LABELS } from "../question-form";
import { QuestionRichContent, RichTextRenderer } from "./RichTextRenderer";
import type { QuestionAnswer, QuestionItem } from "../types";
import { extractHtml, extractImageAssetId, extractText, normalizeOptions } from "../utils";

type PreviewLanguage = "en" | "mr" | "both";
type OptionReviewState = "correct" | "incorrect" | "selected" | "default";
type OptionData = {
  text: string;
  html?: string;
  imageAssetId?: string;
};

const TRUE_FALSE_LABELS = {
  en: { true: "True", false: "False" },
  mr: { true: "बरोबर", false: "चूक" },
} as const;

function stableStringify(value: unknown): string {
  if (value === null || value === undefined) {
    return "null";
  }
  if (typeof value !== "object") {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(",")}]`;
  }

  const entries = Object.entries(value as Record<string, unknown>)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, entry]) => `"${key}":${stableStringify(entry)}`);

  return `{${entries.join(",")}}`;
}

function hasContent(value: unknown, language: PreviewLanguage): boolean {
  if (language === "both") {
    return hasContent(value, "en") || hasContent(value, "mr");
  }

  return Boolean(
    extractText(value, language).trim() ||
      extractHtml(value, language).trim() ||
      extractImageAssetId(value, language)
  );
}

function resolveCorrectIndexes(question: QuestionItem, answer?: QuestionAnswer | null) {
  if (!answer || typeof answer !== "object") {
    return [];
  }
  if ("optionIndex" in answer && typeof answer.optionIndex === "number") {
    return [answer.optionIndex];
  }
  if ("optionIndexes" in answer && Array.isArray(answer.optionIndexes)) {
    return answer.optionIndexes.filter((index): index is number => typeof index === "number");
  }
  if (question.type === "TRUE_FALSE" && "value" in answer && typeof answer.value === "boolean") {
    return [answer.value ? 0 : 1];
  }
  return [];
}

function getAvailableLanguages(
  languageMode: QuestionFormValues["languageMode"]
): Array<{ value: PreviewLanguage; label: string }> {
  if (languageMode === "ENGLISH") {
    return [{ value: "en", label: "English" }];
  }
  if (languageMode === "MARATHI") {
    return [{ value: "mr", label: "Marathi" }];
  }
  return [
    { value: "en", label: "English" },
    { value: "mr", label: "Marathi" },
    { value: "both", label: "Both" },
  ];
}

function resolveSelectedIndexes(question: QuestionItem, answer?: AnswerValue) {
  if (!answer) return [];
  if ("optionIndex" in answer) return [answer.optionIndex];
  if ("optionIndexes" in answer) return answer.optionIndexes;
  if (question.type === "TRUE_FALSE" && "value" in answer && typeof answer.value === "boolean") {
    return [answer.value ? 0 : 1];
  }
  return [];
}

function isAnswerReady(question: QuestionItem, answer?: AnswerValue) {
  if (!answer) return false;

  if (question.type === "SINGLE_CHOICE") {
    return "optionIndex" in answer && typeof answer.optionIndex === "number";
  }
  if (question.type === "MULTI_CHOICE") {
    return "optionIndexes" in answer && answer.optionIndexes.length > 0;
  }
  if (question.type === "TRUE_FALSE") {
    return "value" in answer && typeof answer.value === "boolean";
  }
  if (!("value" in answer)) {
    return false;
  }

  if (typeof answer.value === "string") {
    return answer.value.trim().length > 0;
  }

  return answer.value !== null && answer.value !== undefined;
}

function getCorrectAnswerLabel(question: QuestionItem) {
  const correctAnswer = question.correctAnswerJson;
  if (!correctAnswer || typeof correctAnswer !== "object") {
    return "Not configured";
  }

  if ("optionIndex" in correctAnswer && typeof correctAnswer.optionIndex === "number") {
    return `Option ${QUESTION_OPTION_LABELS[correctAnswer.optionIndex] ?? correctAnswer.optionIndex + 1}`;
  }

  if ("optionIndexes" in correctAnswer && Array.isArray(correctAnswer.optionIndexes)) {
    const labels = correctAnswer.optionIndexes
      .filter((index): index is number => typeof index === "number")
      .map((index) => `Option ${QUESTION_OPTION_LABELS[index] ?? index + 1}`);
    return labels.length ? labels.join(", ") : "Not configured";
  }

  if ("value" in correctAnswer) {
    if (typeof correctAnswer.value === "boolean") {
      return correctAnswer.value ? "True" : "False";
    }
    return String(correctAnswer.value);
  }

  return "Not configured";
}

function getSelectedAnswerLabel(
  question: QuestionItem,
  answer: AnswerValue | undefined,
  language: PreviewLanguage
) {
  if (!answer) {
    return "No answer selected";
  }

  if ("optionIndex" in answer && typeof answer.optionIndex === "number") {
    return `Option ${QUESTION_OPTION_LABELS[answer.optionIndex] ?? answer.optionIndex + 1}`;
  }

  if ("optionIndexes" in answer && Array.isArray(answer.optionIndexes)) {
    const labels = answer.optionIndexes
      .filter((index): index is number => typeof index === "number")
      .map((index) => `Option ${QUESTION_OPTION_LABELS[index] ?? index + 1}`);
    return labels.length ? labels.join(", ") : "No options selected";
  }

  if ("value" in answer) {
    if (question.type === "TRUE_FALSE" && typeof answer.value === "boolean") {
      const labels = language === "mr" ? TRUE_FALSE_LABELS.mr : TRUE_FALSE_LABELS.en;
      return answer.value ? labels.true : labels.false;
    }

    if (typeof answer.value === "string") {
      return answer.value.trim() || "Answer field is empty";
    }

    if (answer.value === null || answer.value === undefined) {
      return "Answer field is empty";
    }

    return String(answer.value);
  }

  return "No answer selected";
}

function OptionRow({
  label,
  primaryOption,
  secondaryOption,
  primaryMarathi,
  secondaryMarathi,
  selected,
  multi,
  disabled,
  reviewState = "default",
  onClick,
}: {
  label: string;
  primaryOption: OptionData;
  secondaryOption?: OptionData;
  primaryMarathi?: boolean;
  secondaryMarathi?: boolean;
  selected: boolean;
  multi: boolean;
  disabled?: boolean;
  reviewState?: OptionReviewState;
  onClick: () => void;
}) {
  const icon = multi
    ? selected
      ? CheckSquare2
      : Square
    : selected
      ? CheckCircle2
      : Circle;
  const Icon = icon;

  const resolveImage = (option?: OptionData) =>
    option?.imageAssetId ? getAssetUrl(option.imageAssetId) : "";

  const primaryImageUrl = resolveImage(primaryOption);
  const secondaryImageUrl = resolveImage(secondaryOption);

  const reviewClass =
    reviewState === "correct"
      ? "border-emerald-500/60 bg-emerald-500/10"
      : reviewState === "incorrect"
        ? "border-destructive/60 bg-destructive/10"
        : reviewState === "selected"
          ? "border-primary bg-primary/5"
          : "border-border bg-background/80";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex w-full items-start gap-3 rounded-2xl border p-3 text-left text-sm transition",
        reviewClass,
        reviewState === "default" && !selected ? "hover:bg-muted/50" : "",
        disabled && "cursor-not-allowed"
      )}
    >
      <div className={cn("mt-0.5", selected ? "text-primary" : "text-muted-foreground")}>
        <Icon className="h-4 w-4" />
      </div>

      <div className="min-w-0 flex-1 space-y-2">
        <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{label}</div>

        <div className="space-y-2">
          <RichTextRenderer
            html={primaryOption.html}
            fallbackText={primaryOption.text}
            className={cn("text-sm text-foreground", primaryMarathi && "font-marathi-unicode")}
          />
          {primaryImageUrl ? (
            <div className="overflow-hidden rounded-xl border border-border bg-muted/20 p-2">
              <img
                src={primaryImageUrl}
                alt="Option media"
                className="question-option-media mx-auto h-auto w-auto max-w-full object-contain"
                loading="lazy"
              />
            </div>
          ) : null}
        </div>

        {secondaryOption ? (
          <div className="space-y-2 rounded-xl border border-border/70 bg-muted/30 p-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Marathi
            </p>
            <RichTextRenderer
              html={secondaryOption.html}
              fallbackText={secondaryOption.text}
              className={cn(
                "text-sm text-foreground",
                secondaryMarathi && "font-marathi-unicode"
              )}
            />
            {secondaryImageUrl ? (
              <div className="overflow-hidden rounded-xl border border-border bg-muted/20 p-2">
                <img
                  src={secondaryImageUrl}
                  alt="Option media Marathi"
                  className="question-option-media mx-auto h-auto w-auto max-w-full object-contain"
                  loading="lazy"
                />
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </button>
  );
}

function QuestionPreviewCard({
  question,
  language,
  answer,
  checked,
  onAnswerChange,
}: {
  question: QuestionItem;
  language: PreviewLanguage;
  answer?: AnswerValue;
  checked: boolean;
  onAnswerChange: (next: AnswerValue) => void;
}) {
  const isMulti = question.type === "MULTI_CHOICE";
  const isChoice = ["SINGLE_CHOICE", "MULTI_CHOICE", "TRUE_FALSE"].includes(question.type);
  const isInteger = question.type === "INTEGER";
  const showBothLanguages = language === "both";
  const primaryLanguage = language === "mr" ? "mr" : "en";

  const primaryOptions = showBothLanguages
    ? normalizeOptions(question.optionsJson, "en", false)
    : normalizeOptions(question.optionsJson, primaryLanguage);
  const marathiOptions = showBothLanguages
    ? normalizeOptions(question.optionsJson, "mr", false)
    : [];

  let options = primaryOptions
    .map((option, index) => ({ index, option }))
    .filter(({ option, index }) => {
      const secondaryOption = marathiOptions[index];
      return Boolean(
        option.text ||
          option.html ||
          option.imageAssetId ||
          secondaryOption?.text ||
          secondaryOption?.html ||
          secondaryOption?.imageAssetId
      );
    });

  if (question.type === "TRUE_FALSE" && options.length === 0) {
    options = [
      {
        index: 0,
        option: {
          text: language === "mr" ? TRUE_FALSE_LABELS.mr.true : TRUE_FALSE_LABELS.en.true,
          html: undefined,
          imageAssetId: undefined,
        },
      },
      {
        index: 1,
        option: {
          text: language === "mr" ? TRUE_FALSE_LABELS.mr.false : TRUE_FALSE_LABELS.en.false,
          html: undefined,
          imageAssetId: undefined,
        },
      },
    ];
  }

  const selectedIndexes = React.useMemo(
    () => resolveSelectedIndexes(question, answer),
    [answer, question]
  );

  const currentValue = React.useMemo(() => {
    if (!answer || !("value" in answer)) return "";
    return String(answer.value ?? "");
  }, [answer]);

  const correctOptionIndexes = React.useMemo(
    () => resolveCorrectIndexes(question, question.correctAnswerJson as QuestionAnswer | null),
    [question]
  );

  const isCorrect =
    checked && question.correctAnswerJson
      ? stableStringify(answer) === stableStringify(question.correctAnswerJson)
      : null;

  const inputReviewClass =
    checked && isCorrect === true
      ? "border-emerald-500/60 bg-emerald-500/10"
      : checked && isCorrect === false
        ? "border-destructive/60 bg-destructive/10"
        : undefined;

  const handleOptionClick = (index: number) => {
    if (question.type === "TRUE_FALSE") {
      onAnswerChange({ value: index === 0 });
      return;
    }

    if (isMulti) {
      const current = new Set(selectedIndexes);
      if (current.has(index)) {
        current.delete(index);
      } else {
        current.add(index);
      }
      onAnswerChange({ optionIndexes: Array.from(current).sort((left, right) => left - right) });
      return;
    }

    onAnswerChange({ optionIndex: index });
  };

  const handleInputChange = (value: string) => {
    if (isInteger) {
      const trimmed = value.trim();
      const numeric = Number(trimmed);
      if (trimmed === "") {
        onAnswerChange({ value: "" });
        return;
      }
      onAnswerChange({ value: Number.isNaN(numeric) ? trimmed : numeric });
      return;
    }

    onAnswerChange({ value });
  };

  return (
    <div className="space-y-4 rounded-3xl border border-border bg-card/90 p-5 shadow-sm">
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <span className="rounded-full border border-border bg-background px-2 py-1 uppercase tracking-wide">
          {question.type.replace(/_/g, " ")}
        </span>
        {question.difficulty ? (
          <span className="rounded-full border border-border bg-muted px-2 py-1 uppercase tracking-wide">
            {question.difficulty}
          </span>
        ) : null}
        {question.isPublished ? (
          <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 uppercase tracking-wide text-emerald-700">
            Published
          </span>
        ) : (
          <span className="rounded-full border border-border bg-muted px-2 py-1 uppercase tracking-wide">
            Draft
          </span>
        )}
      </div>

      {hasContent(question.statementJson, language) ? (
        <QuestionRichContent content={question.statementJson} language={language} />
      ) : (
        <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-4 text-sm text-muted-foreground">
          Statement preview will appear here once content is added.
        </div>
      )}

      {isChoice ? (
        options.length > 0 ? (
          <div className="space-y-3">
            {options.map(({ index, option }) => {
              const isSelected = selectedIndexes.includes(index);
              const isCorrectOption = correctOptionIndexes.includes(index);
              const reviewState: OptionReviewState = checked
                ? isCorrectOption
                  ? "correct"
                  : isSelected && isCorrect === false
                    ? "incorrect"
                    : isSelected
                      ? "selected"
                      : "default"
                : isSelected
                  ? "selected"
                  : "default";

              let secondaryOption =
                showBothLanguages && marathiOptions[index]
                  ? {
                      text: marathiOptions[index].text,
                      html: marathiOptions[index].html,
                      imageAssetId: marathiOptions[index].imageAssetId,
                    }
                  : undefined;
              let secondaryMarathi = Boolean(secondaryOption);

              let primaryOption = {
                text: option.text,
                html: option.html,
                imageAssetId: option.imageAssetId,
              };
              let primaryMarathi = language === "mr";

              const primaryHasContent = Boolean(
                primaryOption.text || primaryOption.html || primaryOption.imageAssetId
              );
              const secondaryHasContent = Boolean(
                secondaryOption?.text || secondaryOption?.html || secondaryOption?.imageAssetId
              );

              if (!primaryHasContent && secondaryHasContent && secondaryOption) {
                primaryOption = secondaryOption;
                secondaryOption = undefined;
                primaryMarathi = true;
                secondaryMarathi = false;
              }

              return (
                <OptionRow
                  key={`${question.id}-preview-option-${index}`}
                  label={QUESTION_OPTION_LABELS[index] ?? String(index + 1)}
                  primaryOption={primaryOption}
                  secondaryOption={secondaryOption}
                  primaryMarathi={primaryMarathi}
                  secondaryMarathi={secondaryMarathi}
                  selected={isSelected}
                  multi={isMulti}
                  reviewState={reviewState}
                  onClick={() => handleOptionClick(index)}
                />
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-4 text-sm text-muted-foreground">
            Choice options will appear here after at least one option is filled.
          </div>
        )
      ) : null}

      {question.type === "SHORT_ANSWER" ? (
        <textarea
          className={cn(
            "min-h-[120px] w-full rounded-2xl border border-border bg-background px-3 py-2 text-sm text-foreground",
            inputReviewClass
          )}
          placeholder="Type your answer"
          value={currentValue}
          onChange={(event) => handleInputChange(event.target.value)}
        />
      ) : null}

      {question.type === "INTEGER" ? (
        <Input
          className={inputReviewClass}
          placeholder="Enter numeric answer"
          value={currentValue}
          onChange={(event) => handleInputChange(event.target.value)}
        />
      ) : null}
    </div>
  );
}

export function QuestionPreviewModal({
  open,
  onOpenChange,
  values,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  values: QuestionFormValues;
}) {
  const question = React.useMemo(() => buildQuestionPreviewItem(values), [values]);
  const availableLanguages = React.useMemo(
    () => getAvailableLanguages(values.languageMode),
    [values.languageMode]
  );

  const [language, setLanguage] = React.useState<PreviewLanguage>(availableLanguages[0]?.value ?? "en");
  const [answer, setAnswer] = React.useState<AnswerValue | undefined>(undefined);
  const [checked, setChecked] = React.useState(false);

  const questionSignature = React.useMemo(
    () => `${question.type}:${stableStringify(question.correctAnswerJson)}`,
    [question.correctAnswerJson, question.type]
  );

  React.useEffect(() => {
    if (!availableLanguages.some((item) => item.value === language)) {
      setLanguage(availableLanguages[0]?.value ?? "en");
    }
  }, [availableLanguages, language]);

  React.useEffect(() => {
    if (!open) {
      setAnswer(undefined);
      setChecked(false);
    }
  }, [open]);

  React.useEffect(() => {
    setAnswer(undefined);
    setChecked(false);
  }, [questionSignature]);

  const hasCorrectAnswer = question.correctAnswerJson !== undefined && question.correctAnswerJson !== null;
  const canCheckAnswer = hasCorrectAnswer && isAnswerReady(question, answer);
  const isChoice = ["SINGLE_CHOICE", "MULTI_CHOICE", "TRUE_FALSE"].includes(question.type);
  const renderedOptions = React.useMemo(() => {
    const showBothLanguages = language === "both";
    const primaryLanguage = language === "mr" ? "mr" : "en";
    const primaryOptions = showBothLanguages
      ? normalizeOptions(question.optionsJson, "en", false)
      : normalizeOptions(question.optionsJson, primaryLanguage);
    const marathiOptions = showBothLanguages
      ? normalizeOptions(question.optionsJson, "mr", false)
      : [];

    if (question.type === "TRUE_FALSE") {
      return [0, 1];
    }

    return primaryOptions
      .map((option, index) => ({ option, index }))
      .filter(({ option, index }) => {
        const secondaryOption = marathiOptions[index];
        return Boolean(
          option.text ||
            option.html ||
            option.imageAssetId ||
            secondaryOption?.text ||
            secondaryOption?.html ||
            secondaryOption?.imageAssetId
        );
      })
      .map(({ index }) => index);
  }, [language, question.optionsJson, question.type]);

  const reviewCorrect =
    checked && hasCorrectAnswer ? stableStringify(answer) === stableStringify(question.correctAnswerJson) : null;

  const issues: string[] = [];
  if (!hasContent(question.statementJson, language)) {
    issues.push("Statement content is still empty in this preview.");
  }
  if (isChoice && renderedOptions.length === 0) {
    issues.push("No option content is available yet for this question.");
  }
  if (!hasCorrectAnswer) {
    issues.push("Correct answer is not configured yet, so answer checking is disabled.");
  }
  if (isChoice && hasCorrectAnswer) {
    const missingCorrectOption = resolveCorrectIndexes(
      question,
      question.correctAnswerJson as QuestionAnswer | null
    ).some((index) => !renderedOptions.includes(index));

    if (missingCorrectOption) {
      issues.push("Correct answer points to an empty option. Students may not be able to answer this question correctly.");
    }
  }

  const handleAnswerChange = (next: AnswerValue) => {
    setAnswer(next);
    setChecked(false);
  };

  const handleReset = () => {
    setAnswer(undefined);
    setChecked(false);
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Question Preview"
      description="Preview the current unsaved question state and test its answer behavior."
      className="max-w-6xl"
      footer={
        <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
          Close
        </Button>
      }
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {availableLanguages.map((item) => (
              <Button
                key={item.value}
                type="button"
                variant={language === item.value ? "default" : "secondary"}
                size="sm"
                onClick={() => setLanguage(item.value)}
              >
                {item.label}
              </Button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="secondary" size="sm" onClick={handleReset}>
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={!canCheckAnswer}
              onClick={() => setChecked(true)}
            >
              Check answer
            </Button>
          </div>
        </div>

        {issues.length ? (
          <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-900">
            <div className="mb-2 flex items-center gap-2 font-medium">
              <AlertCircle className="h-4 w-4" />
              Preview notes
            </div>
            <ul className="space-y-1">
              {issues.map((issue) => (
                <li key={issue}>{issue}</li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-4">
            <QuestionPreviewCard
              question={question}
              language={language}
              answer={answer}
              checked={checked}
              onAnswerChange={handleAnswerChange}
            />

            <div className="rounded-3xl border border-border bg-card/70 p-5 shadow-sm">
              <div className="mb-3">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Explanation
                </p>
                <h3 className="text-sm font-semibold text-foreground">Solution preview</h3>
              </div>

              {hasContent(question.explanationJson, language) ? (
                <QuestionRichContent content={question.explanationJson} language={language} />
              ) : (
                <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-4 text-sm text-muted-foreground">
                  Explanation preview will appear here once content is added.
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-3xl border border-border bg-card/70 p-5 shadow-sm">
              <div className="mb-3">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Review
                </p>
                <h3 className="text-sm font-semibold text-foreground">Answer check</h3>
              </div>

              <div
                className={cn(
                  "rounded-2xl border p-3 text-sm",
                  checked && reviewCorrect === true
                    ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-800"
                    : checked && reviewCorrect === false
                      ? "border-destructive/40 bg-destructive/10 text-foreground"
                      : "border-border bg-muted/20 text-muted-foreground"
                )}
              >
                {checked ? (
                  reviewCorrect ? (
                    <p className="font-medium">Selected answer matches the configured correct answer.</p>
                  ) : (
                    <p className="font-medium">Selected answer does not match the configured correct answer.</p>
                  )
                ) : (
                  <p>Select an answer in the preview, then use the check action.</p>
                )}
              </div>

              <div className="mt-4 space-y-2 text-sm">
                <div className="rounded-2xl border border-border bg-background/60 p-3">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    Configured correct answer
                  </p>
                  <p className="mt-1 font-medium text-foreground">{getCorrectAnswerLabel(question)}</p>
                </div>

                {checked && reviewCorrect === false && hasCorrectAnswer ? (
                  <div className="rounded-2xl border border-border bg-background/60 p-3">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      Selected answer
                    </p>
                    <p className="mt-1 font-medium text-foreground">
                      {getSelectedAnswerLabel(question, answer, language)}
                    </p>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="rounded-3xl border border-border bg-card/70 p-5 shadow-sm text-sm text-muted-foreground">
              This preview follows the current form state, including unsaved edits, language selection, explanation content, and choice-answer review styling.
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
