"use client";

import { apiFetch } from "@/lib/api/client";
import type { NoteItem } from "./types";
import type { NoteCreateInput, NoteUpdateInput } from "./schemas";

export type NoteFilters = {
  subjectId?: string;
  topicId?: string;
  isPublished?: boolean;
  isPremium?: boolean;
};

function normalizeList(payload: unknown): NoteItem[] {
  if (Array.isArray(payload)) {
    return payload as NoteItem[];
  }
  if (payload && typeof payload === "object") {
    const typed = payload as Record<string, unknown>;
    if (Array.isArray(typed.items)) {
      return typed.items as NoteItem[];
    }
    if (Array.isArray(typed.data)) {
      return typed.data as NoteItem[];
    }
  }
  return [];
}

export async function listNotes(filters: NoteFilters = {}) {
  const params = new URLSearchParams();
  if (filters.subjectId) params.set("subjectId", filters.subjectId);
  if (filters.topicId) params.set("topicId", filters.topicId);
  if (typeof filters.isPublished === "boolean") {
    params.set("isPublished", String(filters.isPublished));
  }
  if (typeof filters.isPremium === "boolean") {
    params.set("isPremium", String(filters.isPremium));
  }
  const queryString = params.toString();
  const data = await apiFetch<unknown>(
    `/admin/notes${queryString ? `?${queryString}` : ""}`,
    { method: "GET" }
  );
  return normalizeList(data);
}

export async function createNote(input: NoteCreateInput) {
  return apiFetch<NoteItem>("/admin/notes", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateNote(noteId: string, input: NoteUpdateInput) {
  return apiFetch<NoteItem>(`/admin/notes/${noteId}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function publishNote(noteId: string) {
  return apiFetch<NoteItem>(`/admin/notes/${noteId}/publish`, {
    method: "POST",
  });
}

export async function unpublishNote(noteId: string) {
  return apiFetch<NoteItem>(`/admin/notes/${noteId}/unpublish`, {
    method: "POST",
  });
}
