"use client";

import { apiFetch } from "@/lib/api/client";
import type {
  TestCreateInput,
  TestItem,
  TestListResponse,
  TestPreset,
  TestType,
} from "./types";

export type TestFilters = {
  subjectId?: string;
  type?: TestType;
  isPublished?: boolean;
  page?: number;
  pageSize?: number;
};

function normalizeList(payload: unknown): TestListResponse {
  if (payload && typeof payload === "object") {
    const typed = payload as Record<string, unknown>;
    if (Array.isArray(typed.data)) {
      return typed as TestListResponse;
    }
    if (Array.isArray(typed.items)) {
      return {
        data: typed.items as TestItem[],
        total: Number(typed.total ?? (typed.items as TestItem[]).length),
        page: Number(typed.page ?? 1),
        pageSize: Number(typed.pageSize ?? (typed.items as TestItem[]).length),
      };
    }
  }
  if (Array.isArray(payload)) {
    return {
      data: payload as TestItem[],
      total: payload.length,
      page: 1,
      pageSize: payload.length,
    };
  }
  return { data: [], total: 0, page: 1, pageSize: 20 };
}

export async function listTests(filters: TestFilters = {}) {
  const params = new URLSearchParams();
  if (filters.subjectId) params.set("subjectId", filters.subjectId);
  if (filters.type) params.set("type", filters.type);
  if (typeof filters.isPublished === "boolean") {
    params.set("isPublished", String(filters.isPublished));
  }
  if (filters.page) params.set("page", String(filters.page));
  if (filters.pageSize) params.set("pageSize", String(filters.pageSize));

  const queryString = params.toString();
  const data = await apiFetch<unknown>(
    `/admin/tests${queryString ? `?${queryString}` : ""}`,
    { method: "GET" }
  );
  return normalizeList(data);
}

export async function createTest(input: TestCreateInput) {
  return apiFetch<TestItem>("/admin/tests", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateTest(testId: string, input: Partial<TestCreateInput>) {
  return apiFetch<TestItem>(`/admin/tests/${testId}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function publishTest(testId: string) {
  return apiFetch<TestItem>(`/admin/tests/${testId}/publish`, {
    method: "POST",
  });
}

export async function unpublishTest(testId: string) {
  return apiFetch<TestItem>(`/admin/tests/${testId}/unpublish`, {
    method: "POST",
  });
}

export async function listTestPresets() {
  const response = await apiFetch<{ data?: TestPreset[] }>(
    "/admin/tests/presets",
    { method: "GET" },
  );
  return response?.data ?? [];
}
