"use client";

import { z } from "zod";
import { hasMeaningfulHtml } from "./utils";

const OptionSchema = z.object({
  text: z.string().optional(),
  html: z.string().optional(),
  imageAssetId: z.string().optional(),
});

const LocalizedContentSchema = z.object({
  text: z.string().optional(),
  html: z.string().optional(),
  imageAssetId: z.string().optional(),
});

function hasLocalizedContent(value: z.infer<typeof LocalizedContentSchema>) {
  const text = value.text?.trim() || "";
  const html = value.html?.trim() || "";
  return Boolean(text || hasMeaningfulHtml(html) || value.imageAssetId?.trim());
}

function countFilledOptions(options: Array<z.infer<typeof OptionSchema>>) {
  return options.filter((option) =>
    Boolean(option.text?.trim() || hasMeaningfulHtml(option.html?.trim()) || option.imageAssetId?.trim())
  ).length;
}

export const QuestionFormSchema = z
  .object({
    subjectId: z.string().min(1, "Subject is required"),
    topicId: z.string().optional(),
    type: z.enum(["SINGLE_CHOICE", "MULTI_CHOICE", "TRUE_FALSE", "INTEGER", "SHORT_ANSWER"]),
    difficulty: z.enum(["EASY", "MEDIUM", "HARD"]).optional(),
    languageMode: z.enum(["ENGLISH", "MARATHI", "BILINGUAL"]),
    statementEn: LocalizedContentSchema,
    statementMr: LocalizedContentSchema,
    optionsEn: z.array(OptionSchema).length(4),
    optionsMr: z.array(OptionSchema).length(4),
    correctOptionIndex: z.number().int().min(0).max(3).optional(),
    correctOptionIndexes: z.array(z.number().int().min(0).max(3)).optional(),
    correctBoolean: z.enum(["true", "false"]).optional(),
    correctText: z.string().optional(),
    explanationEn: LocalizedContentSchema,
    explanationMr: LocalizedContentSchema,
    isPublished: z.boolean().optional(),
  })
  .superRefine((values, ctx) => {
    const needsEnglish = values.languageMode !== "MARATHI";
    const needsMarathi = values.languageMode !== "ENGLISH";
    const needsChoiceOptions = values.type === "SINGLE_CHOICE" || values.type === "MULTI_CHOICE";

    if (needsEnglish && !hasLocalizedContent(values.statementEn)) {
      ctx.addIssue({
        code: "custom",
        path: ["statementEn", "text"],
        message: "English statement is required.",
      });
    }

    if (needsMarathi && !hasLocalizedContent(values.statementMr)) {
      ctx.addIssue({
        code: "custom",
        path: ["statementMr", "text"],
        message: "Marathi statement is required.",
      });
    }

    if (needsChoiceOptions && needsEnglish && countFilledOptions(values.optionsEn) < 2) {
      ctx.addIssue({
        code: "custom",
        path: ["optionsEn"],
        message: "Add at least two English options.",
      });
    }

    if (needsChoiceOptions && needsMarathi && countFilledOptions(values.optionsMr) < 2) {
      ctx.addIssue({
        code: "custom",
        path: ["optionsMr"],
        message: "Add at least two Marathi options.",
      });
    }
  });

export type QuestionFormValues = z.infer<typeof QuestionFormSchema>;
