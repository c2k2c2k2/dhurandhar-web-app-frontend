"use client";

import { apiFetch } from "@/lib/api/client";
import type { UserDetail, UserListResponse } from "./types";

export type UsersQuery = {
  search?: string;
  type?: string;
  status?: string;
  hasActiveSubscription?: string;
  page?: number;
  pageSize?: number;
};

export type EntitlementPayload = {
  kind: string;
  scopeJson?: Record<string, unknown>;
  reason?: string;
  startsAt?: string;
  endsAt?: string;
};

function buildQuery(query: UsersQuery) {
  const params = new URLSearchParams();
  if (query.search) params.set("search", query.search);
  if (query.type) params.set("type", query.type);
  if (query.status) params.set("status", query.status);
  if (query.hasActiveSubscription)
    params.set("hasActiveSubscription", query.hasActiveSubscription);
  if (query.page) params.set("page", String(query.page));
  if (query.pageSize) params.set("pageSize", String(query.pageSize));
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export async function listUsers(query: UsersQuery) {
  return apiFetch<UserListResponse>(`/users${buildQuery(query)}`, {
    method: "GET",
  });
}

export async function getUser(userId: string) {
  return apiFetch<UserDetail>(`/users/${userId}`, { method: "GET" });
}

export async function blockUser(userId: string, reason?: string) {
  return apiFetch(`/users/${userId}/block`, {
    method: "PATCH",
    body: JSON.stringify(reason ? { reason } : {}),
  });
}

export async function unblockUser(userId: string) {
  return apiFetch(`/users/${userId}/unblock`, { method: "PATCH" });
}

export async function forceLogout(userId: string) {
  return apiFetch(`/users/${userId}/force-logout`, { method: "POST" });
}

export async function grantEntitlement(userId: string, payload: EntitlementPayload) {
  return apiFetch(`/users/${userId}/entitlements/grant`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function revokeEntitlement(userId: string, payload: EntitlementPayload) {
  return apiFetch(`/users/${userId}/entitlements/revoke`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
