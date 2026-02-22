"use client";

import { z } from "zod";

export const TestFormSchema = z
  .object({
    title: z.string().min(2, "Title is required"),
    description: z.string().optional(),
    type: z.enum(["SUBJECT", "COMBINED", "CUSTOM"]),
    subjectId: z.string().optional(),
    startsAt: z.string().optional(),
    endsAt: z.string().optional(),
    presetKey: z.string().optional(),
    mixerCount: z.number().int().positive().optional(),
    mixerDifficulty: z.enum(["EASY", "MEDIUM", "HARD"]).optional(),
    mixerTopicIds: z.array(z.string()).optional(),
    questionIdsText: z.string().optional(),
    sectionsJson: z.string().optional(),
    durationMinutes: z.number().int().positive().optional(),
    marksPerQuestion: z.number().positive().optional(),
    negativeMarksPerWrong: z.number().min(0).optional(),
    isPublished: z.boolean().optional(),
  })
  .superRefine((values, ctx) => {
    if (values.type === "SUBJECT" && !values.subjectId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["subjectId"],
        message: "Subject is required for subject tests.",
      });
    }
    if (values.type === "CUSTOM") {
      const ids = values.questionIdsText?.trim() || "";
      if (!ids) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["questionIdsText"],
          message: "Add at least one question id.",
        });
      }
    } else {
      if (
        !values.presetKey &&
        (!values.mixerCount || values.mixerCount <= 0)
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["mixerCount"],
          message: "Mixer count must be greater than 0.",
        });
      }
    }

    if (values.sectionsJson?.trim()) {
      try {
        const parsed = JSON.parse(values.sectionsJson);
        if (!Array.isArray(parsed)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["sectionsJson"],
            message: "Sections JSON must be an array.",
          });
        }
      } catch {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["sectionsJson"],
          message: "Sections JSON is invalid.",
        });
      }
    }
  });

export type TestFormValues = z.infer<typeof TestFormSchema>;
