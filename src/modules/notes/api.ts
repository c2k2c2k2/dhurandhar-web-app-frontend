"use client";

import { apiFetch } from "@/lib/api/client";
import type { NoteItem, NoteListResponse } from "./types";
import type { NoteCreateInput, NoteUpdateInput } from "./schemas";

export type NoteFilters = {
  subjectId?: string;
  topicId?: string;
  isPublished?: boolean;
  isPremium?: boolean;
  page?: number;
  pageSize?: number;
};

function normalizeList(payload: unknown): NoteListResponse {
  if (payload && typeof payload === "object") {
    const typed = payload as Record<string, unknown>;
    if (Array.isArray(typed.data)) {
      return {
        data: typed.data as NoteItem[],
        total: Number(typed.total ?? (typed.data as NoteItem[]).length),
        page: Number(typed.page ?? 1),
        pageSize: Number(typed.pageSize ?? 20),
      };
    }
    if (Array.isArray(typed.items)) {
      return {
        data: typed.items as NoteItem[],
        total: Number(typed.total ?? (typed.items as NoteItem[]).length),
        page: Number(typed.page ?? 1),
        pageSize: Number(typed.pageSize ?? 20),
      };
    }
  }
  if (Array.isArray(payload)) {
    return {
      data: payload as NoteItem[],
      total: payload.length,
      page: 1,
      pageSize: payload.length || 20,
    };
  }
  return { data: [], total: 0, page: 1, pageSize: 20 };
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
  if (filters.page) params.set("page", String(filters.page));
  if (filters.pageSize) params.set("pageSize", String(filters.pageSize));
  const queryString = params.toString();
  const data = await apiFetch<unknown>(
    `/admin/notes${queryString ? `?${queryString}` : ""}`,
    { method: "GET" }
  );
  return normalizeList(data);
}

export async function getNote(noteId: string) {
  return apiFetch<NoteItem>(`/admin/notes/${noteId}`, { method: "GET" });
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

export async function deleteNote(noteId: string) {
  return apiFetch<{ success: boolean }>(`/admin/notes/${noteId}`, {
    method: "DELETE",
  });
}
