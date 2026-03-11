"use client";

import { apiFetch } from "@/lib/api/client";
import { getAssetUrl } from "@/lib/api/assets";
import type {
  QuestionCreateInput,
  QuestionDetail,
  QuestionDifficulty,
  QuestionItem,
  QuestionListResponse,
  QuestionType,
  QuestionUpdateInput,
} from "./types";

export type QuestionFilters = {
  q?: string;
  subjectId?: string;
  topicId?: string;
  type?: QuestionType;
  difficulty?: QuestionDifficulty;
  isPublished?: boolean;
  page?: number;
  pageSize?: number;
};

function normalizeList(payload: unknown): QuestionListResponse {
  if (payload && typeof payload === "object") {
    const typed = payload as Record<string, unknown>;
    if (Array.isArray(typed.data)) {
      return {
        data: typed.data as QuestionItem[],
        total: Number(typed.total ?? (typed.data as QuestionItem[]).length),
        page: Number(typed.page ?? 1),
        pageSize: Number(typed.pageSize ?? 20),
      };
    }
    if (Array.isArray(typed.items)) {
      return {
        data: typed.items as QuestionItem[],
        total: Number(typed.total ?? (typed.items as QuestionItem[]).length),
        page: Number(typed.page ?? 1),
        pageSize: Number(typed.pageSize ?? 20),
      };
    }
  }
  if (Array.isArray(payload)) {
    return {
      data: payload as QuestionItem[],
      total: payload.length,
      page: 1,
      pageSize: payload.length || 20,
    };
  }
  return { data: [], total: 0, page: 1, pageSize: 20 };
}

export async function listQuestions(filters: QuestionFilters = {}) {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.subjectId) params.set("subjectId", filters.subjectId);
  if (filters.topicId) params.set("topicId", filters.topicId);
  if (filters.type) params.set("type", filters.type);
  if (filters.difficulty) params.set("difficulty", filters.difficulty);
  if (typeof filters.isPublished === "boolean") {
    params.set("isPublished", String(filters.isPublished));
  }
  if (filters.page) params.set("page", String(filters.page));
  if (filters.pageSize) params.set("pageSize", String(filters.pageSize));
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

export async function deleteQuestion(questionId: string) {
  return apiFetch<{ success: boolean }>(`/admin/questions/${questionId}`, {
    method: "DELETE",
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
