"use client";

import { apiFetch } from "@/lib/api/client";
import type { SecurityProfile, SecuritySignalsResponse, SecuritySummary } from "./types";

export type SecuritySignalsQuery = {
  noteId?: string;
  userId?: string;
  signalType?: string;
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
};

export type SecuritySummaryQuery = {
  from?: string;
  to?: string;
  limit?: number;
};

function buildQuery(params: Record<string, string | number | undefined>) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    query.set(key, String(value));
  });
  const qs = query.toString();
  return qs ? `?${qs}` : "";
}

export async function listSecuritySignals(query: SecuritySignalsQuery) {
  return apiFetch<SecuritySignalsResponse>(
    `/admin/notes/security-signals${buildQuery(query)}`,
    { method: "GET" }
  );
}

export async function getSecuritySummary(query: SecuritySummaryQuery) {
  return apiFetch<SecuritySummary>(
    `/admin/notes/security-summary${buildQuery(query)}`,
    { method: "GET" }
  );
}

export async function getUserSecurityProfile(userId: string, limit = 20) {
  return apiFetch<SecurityProfile>(
    `/admin/notes/security/users/${userId}${buildQuery({ limit })}`,
    { method: "GET" }
  );
}

export async function revokeSession(sessionId: string) {
  return apiFetch(`/admin/notes/security/sessions/${sessionId}/revoke`, {
    method: "POST",
  });
}

export async function revokeNoteSessions(noteId: string) {
  return apiFetch(`/admin/notes/${noteId}/revoke-sessions`, {
    method: "POST",
  });
}

export async function banUserForNote(noteId: string, userId: string, reason?: string) {
  return apiFetch(`/admin/notes/${noteId}/ban/${userId}`, {
    method: "POST",
    body: JSON.stringify(reason ? { reason } : {}),
  });
}

export async function unbanUserForNote(noteId: string, userId: string) {
  return apiFetch(`/admin/notes/${noteId}/unban/${userId}`, {
    method: "POST",
  });
}
