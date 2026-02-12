import { apiFetch } from "@/lib/api/client";
import { getAccessToken } from "@/lib/auth/tokenStore";
import type {
  NoteDetail,
  NoteItem,
  NoteTreeSubject,
  NoteViewSession,
  WatermarkResponse,
} from "@/modules/student-notes/types";

export type NoteListFilters = {
  subjectId?: string;
  topicId?: string;
  isPremium?: boolean;
};

export async function listNotes(filters: NoteListFilters = {}) {
  const params = new URLSearchParams();
  if (filters.subjectId) params.set("subjectId", filters.subjectId);
  if (filters.topicId) params.set("topicId", filters.topicId);
  if (filters.isPremium !== undefined) params.set("isPremium", String(filters.isPremium));

  const query = params.toString();
  return apiFetch<NoteItem[]>(`/notes${query ? `?${query}` : ""}`, {
    method: "GET",
    auth: false,
  });
}

export async function getNote(noteId: string) {
  return apiFetch<NoteDetail>(`/notes/${noteId}`, { method: "GET", auth: false });
}

export async function getNotesTree() {
  return apiFetch<NoteTreeSubject[]>(`/notes/tree`, { method: "GET", auth: false });
}

export async function createViewSession(noteId: string) {
  return apiFetch<NoteViewSession>(`/notes/${noteId}/view-session`, {
    method: "POST",
  });
}

export async function getWatermark(noteId: string, viewToken: string) {
  const query = new URLSearchParams({ token: viewToken });
  return apiFetch<WatermarkResponse>(`/notes/${noteId}/watermark?${query}`, {
    method: "GET",
  });
}

export async function updateNoteProgress(
  noteId: string,
  payload: { lastPage?: number; completionPercent?: number }
) {
  return apiFetch<{ success: boolean }>(`/notes/${noteId}/progress`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function resetViewSessions(noteId: string) {
  return apiFetch<{ success: boolean; revoked?: number }>(
    `/notes/${noteId}/view-session/reset`,
    {
      method: "POST",
    }
  );
}

export async function streamPdf(noteId: string, viewToken: string) {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
  const url = `${baseUrl}/notes/${noteId}/content?token=${encodeURIComponent(viewToken)}`;
  const token = getAccessToken();

  const response = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });

  if (!response.ok) {
    throw new Error("Failed to fetch PDF stream.");
  }

  return response.arrayBuffer();
}
