"use client";

import { z } from "zod";

export const NoteCreateSchema = z.object({
  subjectId: z.string().min(1, "Subject is required"),
  title: z.string().min(2, "Title is required"),
  description: z.string().optional(),
  isPremium: z.boolean().optional(),
  fileAssetId: z.string().optional(),
  pageCount: z.number().int().nonnegative().optional(),
  topicIds: z.array(z.string()).optional(),
});

export const NoteUpdateSchema = z.object({
  title: z.string().min(2, "Title is required").optional(),
  description: z.string().optional(),
  isPremium: z.boolean().optional(),
  fileAssetId: z.string().optional(),
  pageCount: z.number().int().nonnegative().optional(),
  topicIds: z.array(z.string()).optional(),
});

export type NoteCreateInput = z.infer<typeof NoteCreateSchema>;
export type NoteUpdateInput = z.infer<typeof NoteUpdateSchema>;
