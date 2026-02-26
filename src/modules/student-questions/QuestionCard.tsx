"use client";

import * as React from "react";
import { CheckCircle2, CheckSquare2, Circle, Square } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { getAssetUrl } from "@/lib/api/assets";
import { useI18n } from "@/modules/i18n";
import { normalizeOptions } from "@/modules/questions/utils";
import { QuestionRichContent, RichTextRenderer } from "@/modules/questions/components/RichTextRenderer";
import type { QuestionAnswer, QuestionItem } from "@/modules/questions/types";
import { useQuestionLanguage } from "./QuestionLanguageProvider";
import type { AnswerValue } from "./types";

type OptionData = {
  text: string;
  html?: string;
  imageAssetId?: string;
};

type OptionReviewState = "correct" | "incorrect" | "selected" | "default";

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
            className={cn(
              "text-sm text-foreground",
              primaryMarathi && "font-marathi-unicode"
            )}
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

export function QuestionCard({
  question,
  answer,
  onAnswerChange,
  disabled,
  showMeta = true,
  review,
}: {
  question: QuestionItem;
  answer?: AnswerValue;
  onAnswerChange: (answer: AnswerValue) => void;
  disabled?: boolean;
  showMeta?: boolean;
  review?: {
    isCorrect?: boolean | null;
    correctAnswerJson?: unknown;
  };
}) {
  const { t } = useI18n();
  const { mode } = useQuestionLanguage();

  const isMulti = question.type === "MULTI_CHOICE";
  const isChoice = ["SINGLE_CHOICE", "MULTI_CHOICE", "TRUE_FALSE"].includes(question.type);
  const isInteger = question.type === "INTEGER";

  const primaryLanguage = mode === "mr" ? "mr" : "en";
  const showBothLanguages = mode === "both";

  const primaryOptions = showBothLanguages
    ? normalizeOptions(question.optionsJson, "en", false)
    : normalizeOptions(question.optionsJson, primaryLanguage);
  const marathiOptions = showBothLanguages
    ? normalizeOptions(question.optionsJson, "mr", false)
    : [];

  let options = primaryOptions.filter(
    (option) => option.text || option.html || option.imageAssetId
  );

  if (question.type === "TRUE_FALSE" && options.length === 0) {
    options = [
      {
        text: t("student.question.true", "True"),
        html: undefined,
        imageAssetId: undefined,
      },
      {
        text: t("student.question.false", "False"),
        html: undefined,
        imageAssetId: undefined,
      },
    ];
  }

  const selectedIndexes = React.useMemo(() => {
    if (!answer) return [];
    if ("optionIndex" in answer) return [answer.optionIndex];
    if ("optionIndexes" in answer) return answer.optionIndexes;
    if (question.type === "TRUE_FALSE" && "value" in answer && typeof answer.value === "boolean") {
      return [answer.value ? 0 : 1];
    }
    return [];
  }, [answer, question.type]);

  const currentValue = React.useMemo(() => {
    if (!answer) return "";
    if ("value" in answer) return String(answer.value ?? "");
    return "";
  }, [answer]);

  const correctOptionIndexes = React.useMemo(
    () => resolveCorrectIndexes(question, review?.correctAnswerJson as QuestionAnswer | null),
    [question, review?.correctAnswerJson]
  );

  const handleOptionClick = (index: number) => {
    if (disabled) return;

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
      onAnswerChange({ optionIndexes: Array.from(current).sort() });
      return;
    }
    onAnswerChange({ optionIndex: index });
  };

  const handleInputChange = (value: string) => {
    if (disabled) return;
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
      {showMeta ? (
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span className="rounded-full border border-border bg-background px-2 py-1 uppercase tracking-wide">
            {question.type.replace("_", " ")}
          </span>
          {question.difficulty ? (
            <span className="rounded-full border border-border bg-muted px-2 py-1 uppercase tracking-wide">
              {question.difficulty}
            </span>
          ) : null}
        </div>
      ) : null}

      <QuestionRichContent
        content={question.statementJson}
        language={showBothLanguages ? "both" : primaryLanguage}
      />

      {isChoice && options.length > 0 ? (
        <div className="space-y-3">
          {options.map((option, index) => {
            const isSelected = selectedIndexes.includes(index);
            const isCorrectOption = correctOptionIndexes.includes(index);
            const showReviewedState = Boolean(review?.correctAnswerJson);
            const reviewState: OptionReviewState = showReviewedState
              ? isCorrectOption
                ? "correct"
                : isSelected && review?.isCorrect === false
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
            let primaryMarathi = mode === "mr";

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
                key={`${question.id}-option-${index}`}
                label={String.fromCharCode(65 + index)}
                primaryOption={primaryOption}
                secondaryOption={secondaryOption}
                primaryMarathi={primaryMarathi}
                secondaryMarathi={secondaryMarathi}
                selected={isSelected}
                multi={isMulti}
                disabled={disabled}
                reviewState={reviewState}
                onClick={() => handleOptionClick(index)}
              />
            );
          })}
        </div>
      ) : null}

      {question.type === "SHORT_ANSWER" ? (
        <textarea
          className={cn(
            "min-h-[120px] w-full rounded-2xl border border-border bg-background px-3 py-2 text-sm",
            disabled && "cursor-not-allowed opacity-70"
          )}
          placeholder="Type your answer"
          value={currentValue}
          onChange={(event) => handleInputChange(event.target.value)}
          disabled={disabled}
        />
      ) : null}

      {question.type === "INTEGER" ? (
        <Input
          placeholder="Enter numeric answer"
          value={currentValue}
          onChange={(event) => handleInputChange(event.target.value)}
          disabled={disabled}
        />
      ) : null}
    </div>
  );
}
