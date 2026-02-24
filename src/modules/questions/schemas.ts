"use client";

import { z } from "zod";
import { hasMeaningfulHtml } from "./utils";

const OptionSchema = z.object({
  text: z.string().optional(),
  html: z.string().optional(),
  imageAssetId: z.string().optional(),
});

export const QuestionFormSchema = z.object({
  subjectId: z.string().min(1, "Subject is required"),
  topicId: z.string().optional(),
  type: z.enum(["SINGLE_CHOICE", "MULTI_CHOICE", "TRUE_FALSE", "INTEGER", "SHORT_ANSWER"]),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]).optional(),
  statementText: z.string().optional(),
  statementHtml: z.string().optional(),
  statementImageAssetId: z.string().optional(),
  options: z.array(OptionSchema).length(4),
  correctOptionIndex: z.number().int().min(0).max(3).optional(),
  correctOptionIndexes: z.array(z.number().int().min(0).max(3)).optional(),
  correctBoolean: z.enum(["true", "false"]).optional(),
  correctText: z.string().optional(),
  explanationText: z.string().optional(),
  explanationHtml: z.string().optional(),
  explanationImageAssetId: z.string().optional(),
  isPublished: z.boolean().optional(),
}).superRefine((values, ctx) => {
  const statementText = values.statementText?.trim() || "";
  const statementHtml = values.statementHtml?.trim() || "";
  if (!statementText && !hasMeaningfulHtml(statementHtml)) {
    ctx.addIssue({
      code: "custom",
      path: ["statementText"],
      message: "Statement is required",
    });
  }
});

export type QuestionFormValues = z.infer<typeof QuestionFormSchema>;
