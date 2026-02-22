"use client";

import * as React from "react";
import {
  CheckCircle2,
  Circle,
  CheckSquare2,
  Square,
  Image as ImageIcon,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useI18n } from "@/modules/i18n";
import {
  extractImageAssetId,
  extractText,
  normalizeOptions,
} from "@/modules/questions/utils";
import type { QuestionContentBlock, QuestionItem } from "@/modules/questions/types";
import type { AnswerValue } from "@/modules/student-questions/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

function resolveAssetUrl(assetId?: string) {
  if (!assetId) return undefined;
  if (API_BASE_URL) return `${API_BASE_URL}/assets/${assetId}`;
  return `/assets/${assetId}`;
}

function QuestionContent({
  content,
  language,
}: {
  content?: QuestionContentBlock | string | null;
  language: string;
}) {
  if (!content) return null;
  const text = extractText(content, language);
  const imageAssetId = extractImageAssetId(content);
  const imageUrl = resolveAssetUrl(imageAssetId);

  return (
    <div className="space-y-3">
      {text ? <p className="text-sm leading-relaxed">{text}</p> : null}
      {imageUrl ? (
        <div className="overflow-hidden rounded-2xl border border-border bg-muted/40">
          <img
            src={imageUrl}
            alt="Question media"
            className="w-full object-contain"
            loading="lazy"
          />
        </div>
      ) : null}
      {!text && !imageUrl ? (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <ImageIcon className="h-4 w-4" />
          Media attached
        </div>
      ) : null}
    </div>
  );
}

function OptionRow({
  label,
  option,
  selected,
  multi,
  disabled,
  onClick,
}: {
  label: string;
  option: { text: string; imageAssetId?: string };
  selected: boolean;
  multi: boolean;
  disabled?: boolean;
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
  const imageUrl = resolveAssetUrl(option.imageAssetId);

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex w-full items-start gap-3 rounded-2xl border border-border bg-background/80 p-3 text-left text-sm transition",
        selected ? "border-primary bg-primary/5" : "hover:bg-muted/50",
        disabled && "cursor-not-allowed opacity-70"
      )}
    >
      <div className="mt-0.5 text-primary">
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1">
        <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          {label}
        </div>
        {option.text ? (
          <p className="mt-1 text-sm text-foreground">{option.text}</p>
        ) : null}
        {imageUrl ? (
          <div className="mt-2 overflow-hidden rounded-xl border border-border bg-muted/40">
            <img
              src={imageUrl}
              alt="Option media"
              className="w-full object-contain"
              loading="lazy"
            />
          </div>
        ) : null}
      </div>
    </button>
  );
}

export function QuestionCard({
  question,
  answer,
  onAnswerChange,
  disabled,
  showMeta = true,
}: {
  question: QuestionItem;
  answer?: AnswerValue;
  onAnswerChange: (answer: AnswerValue) => void;
  disabled?: boolean;
  showMeta?: boolean;
}) {
  const { language, t } = useI18n();
  const isMulti = question.type === "MULTI_CHOICE";
  const isChoice = ["SINGLE_CHOICE", "MULTI_CHOICE", "TRUE_FALSE"].includes(
    question.type
  );
  const isInteger = question.type === "INTEGER";

  const rawOptions = normalizeOptions(question.optionsJson, language);
  let options = rawOptions.filter((option) => option.text || option.imageAssetId);
  if (question.type === "TRUE_FALSE" && options.length === 0) {
    options = [
      { text: t("student.question.true", "True"), imageAssetId: undefined },
      { text: t("student.question.false", "False"), imageAssetId: undefined },
    ];
  }

  const selectedIndexes = React.useMemo(() => {
    if (!answer) return [];
    if ("optionIndex" in answer) return [answer.optionIndex];
    if ("optionIndexes" in answer) return answer.optionIndexes;
    return [];
  }, [answer]);

  const currentValue = React.useMemo(() => {
    if (!answer) return "";
    if ("value" in answer) return String(answer.value ?? "");
    return "";
  }, [answer]);

  const handleOptionClick = (index: number) => {
    if (disabled) return;
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

      <QuestionContent content={question.statementJson} language={language} />

      {isChoice && options.length > 0 ? (
        <div className="space-y-3">
          {options.map((option, index) => (
            <OptionRow
              key={`${question.id}-option-${index}`}
              label={String.fromCharCode(65 + index)}
              option={option}
              selected={selectedIndexes.includes(index)}
              multi={isMulti}
              disabled={disabled}
              onClick={() => handleOptionClick(index)}
            />
          ))}
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
