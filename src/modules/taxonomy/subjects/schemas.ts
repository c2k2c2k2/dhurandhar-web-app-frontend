"use client";

import { z } from "zod";

export const SubjectCreateSchema = z.object({
  key: z.string().min(2, "Key is required"),
  name: z.string().min(2, "Name is required"),
  orderIndex: z.number().int().nonnegative().optional(),
  isActive: z.boolean().optional(),
});

export const SubjectUpdateSchema = z.object({
  name: z.string().min(2, "Name is required").optional(),
  orderIndex: z.number().int().nonnegative().optional(),
  isActive: z.boolean().optional(),
});

export type SubjectCreateInput = z.infer<typeof SubjectCreateSchema>;
export type SubjectUpdateInput = z.infer<typeof SubjectUpdateSchema>;
