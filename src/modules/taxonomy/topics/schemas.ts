"use client";

import { z } from "zod";

export const TopicCreateSchema = z.object({
  name: z.string().min(2, "Name is required"),
  parentId: z.string().optional(),
  orderIndex: z.number().int().nonnegative().optional(),
  isActive: z.boolean().optional(),
});

export const TopicUpdateSchema = TopicCreateSchema.partial();

export type TopicCreateInput = z.infer<typeof TopicCreateSchema>;
export type TopicUpdateInput = z.infer<typeof TopicUpdateSchema>;
