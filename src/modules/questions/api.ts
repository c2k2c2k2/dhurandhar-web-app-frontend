"use client";

import { apiFetch } from "@/lib/api/client";
import { getAssetUrl } from "@/lib/api/assets";
import type {
  QuestionCreateInput,
  QuestionDetail,
  QuestionDifficulty,
  QuestionItem,
  QuestionType,
  QuestionUpdateInput,
} from "./types";

export type QuestionFilters = {
  subjectId?: string;
  topicId?: string;
  type?: QuestionType;
  difficulty?: QuestionDifficulty;
  isPublished?: boolean;
};

function normalizeList(payload: unknown): QuestionItem[] {
  if (Array.isArray(payload)) {
    return payload as QuestionItem[];
  }
  if (payload && typeof payload === "object") {
    const typed = payload as Record<string, unknown>;
    if (Array.isArray(typed.items)) {
      return typed.items as QuestionItem[];
    }
    if (Array.isArray(typed.data)) {
      return typed.data as QuestionItem[];
    }
  }
  return [];
}

export async function listQuestions(filters: QuestionFilters = {}) {
  const params = new URLSearchParams();
  if (filters.subjectId) params.set("subjectId", filters.subjectId);
  if (filters.topicId) params.set("topicId", filters.topicId);
  if (filters.type) params.set("type", filters.type);
  if (filters.difficulty) params.set("difficulty", filters.difficulty);
  if (typeof filters.isPublished === "boolean") {
    params.set("isPublished", String(filters.isPublished));
  }
  const queryString = params.toString();
  const data = await apiFetch<unknown>(
    `/admin/questions${queryString ? `?${queryString}` : ""}`,
    { method: "GET" }
  );
  return normalizeList(data);
}

export async function getQuestion(questionId: string) {
  return apiFetch<QuestionDetail>(`/admin/questions/${questionId}`, { method: "GET" });
}

export async function createQuestion(input: QuestionCreateInput) {
  return apiFetch<QuestionItem>("/admin/questions", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateQuestion(questionId: string, input: QuestionUpdateInput) {
  return apiFetch<QuestionItem>(`/admin/questions/${questionId}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function publishQuestion(questionId: string) {
  return apiFetch<QuestionItem>(`/admin/questions/${questionId}/publish`, {
    method: "POST",
  });
}

export async function unpublishQuestion(questionId: string) {
  return apiFetch<QuestionItem>(`/admin/questions/${questionId}/unpublish`, {
    method: "POST",
  });
}

export async function bulkImportQuestions(items: QuestionCreateInput[]) {
  return apiFetch<{ count: number; items: { id: string }[] }>(
    "/admin/questions/bulk-import",
    {
      method: "POST",
      body: JSON.stringify({ items }),
    }
  );
}

export { getAssetUrl };
