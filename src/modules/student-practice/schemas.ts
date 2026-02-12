import { z } from "zod";

export const PracticeStartSchema = z.object({
  subjectId: z.string().optional(),
  topicId: z.string().optional(),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]).optional(),
  count: z.number().min(5).max(50).optional(),
});

export type PracticeStartValues = z.infer<typeof PracticeStartSchema>;
