"use client";

import { apiFetch } from "@/lib/api/client";
import type { Subject } from "./types";
import type { SubjectCreateInput, SubjectUpdateInput } from "./schemas";

function normalizeList(payload: unknown): Subject[] {
  if (Array.isArray(payload)) {
    return payload as Subject[];
  }
  if (payload && typeof payload === "object") {
    const typed = payload as Record<string, unknown>;
    if (Array.isArray(typed.items)) {
      return typed.items as Subject[];
    }
    if (Array.isArray(typed.data)) {
      return typed.data as Subject[];
    }
  }
  return [];
}

export async function listSubjects() {
  const data = await apiFetch<unknown>("/subjects", { method: "GET", auth: false });
  return normalizeList(data);
}

export async function createSubject(input: SubjectCreateInput) {
  return apiFetch<Subject>("/admin/subjects", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateSubject(
  subjectId: string,
  input: SubjectUpdateInput,
) {
  return apiFetch<Subject>(`/admin/subjects/${subjectId}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}
