"use client";

import { apiFetch } from "@/lib/api/client";
import type { Topic } from "./types";
import type { TopicCreateInput, TopicUpdateInput } from "./schemas";

function normalizeList(payload: unknown): Topic[] {
  if (Array.isArray(payload)) {
    return payload as Topic[];
  }
  if (payload && typeof payload === "object") {
    const typed = payload as Record<string, unknown>;
    if (Array.isArray(typed.items)) {
      return typed.items as Topic[];
    }
    if (Array.isArray(typed.data)) {
      return typed.data as Topic[];
    }
  }
  return [];
}

export async function listTopics(subjectId: string) {
  const data = await apiFetch<unknown>(
    `/topics?subjectId=${encodeURIComponent(subjectId)}`,
    { method: "GET", auth: false }
  );
  return normalizeList(data);
}

export async function createTopic(subjectId: string, input: TopicCreateInput) {
  return apiFetch<Topic>(`/admin/topics`, {
    method: "POST",
    body: JSON.stringify({ ...input, subjectId }),
  });
}

export async function updateTopic(topicId: string, input: TopicUpdateInput) {
  return apiFetch<Topic>(`/admin/topics/${topicId}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}
