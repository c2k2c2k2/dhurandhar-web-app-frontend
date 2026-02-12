"use client";

import { z } from "zod";

const OptionSchema = z.object({
  text: z.string().optional(),
  imageAssetId: z.string().optional(),
});

export const QuestionFormSchema = z.object({
  subjectId: z.string().min(1, "Subject is required"),
  topicId: z.string().optional(),
  type: z.enum(["SINGLE_CHOICE", "MULTI_CHOICE", "TRUE_FALSE", "INTEGER", "SHORT_ANSWER"]),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]).optional(),
  statementText: z.string().min(1, "Statement is required"),
  statementImageAssetId: z.string().optional(),
  options: z.array(OptionSchema).length(4),
  correctOptionIndex: z.number().int().min(0).max(3).optional(),
  correctOptionIndexes: z.array(z.number().int().min(0).max(3)).optional(),
  correctBoolean: z.enum(["true", "false"]).optional(),
  correctText: z.string().optional(),
  explanationText: z.string().optional(),
  explanationImageAssetId: z.string().optional(),
  isPublished: z.boolean().optional(),
});

export type QuestionFormValues = z.infer<typeof QuestionFormSchema>;
