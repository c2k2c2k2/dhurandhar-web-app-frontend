"use client";

import { apiFetch } from "@/lib/api/client";
import type {
  AccessPermission,
  AccessRole,
  AccessRoleListResponse,
  RolePayload,
} from "./types";

export type { RolePayload };

export type RoleListQuery = {
  page?: number;
  pageSize?: number;
};

function normalizeRoleList(payload: unknown): AccessRoleListResponse {
  if (payload && typeof payload === "object") {
    const typed = payload as Record<string, unknown>;
    if (Array.isArray(typed.data)) {
      return {
        data: typed.data as AccessRole[],
        total: Number(typed.total ?? (typed.data as AccessRole[]).length),
        page: Number(typed.page ?? 1),
        pageSize: Number(typed.pageSize ?? 20),
      };
    }
  }
  if (Array.isArray(payload)) {
    return {
      data: payload as AccessRole[],
      total: payload.length,
      page: 1,
      pageSize: payload.length || 20,
    };
  }
  return { data: [], total: 0, page: 1, pageSize: 20 };
}

export async function listPermissions() {
  return apiFetch<AccessPermission[]>("/admin/rbac/permissions", {
    method: "GET",
  });
}

export async function listRoles(query: RoleListQuery = {}) {
  const params = new URLSearchParams();
  if (query.page) params.set("page", String(query.page));
  if (query.pageSize) params.set("pageSize", String(query.pageSize));
  const qs = params.toString();
  const data = await apiFetch<unknown>(`/admin/rbac/roles${qs ? `?${qs}` : ""}`, {
    method: "GET",
  });
  return normalizeRoleList(data);
}

export async function createRole(payload: RolePayload) {
  return apiFetch<AccessRole>("/admin/rbac/roles", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateRole(roleId: string, payload: RolePayload) {
  return apiFetch<AccessRole>(`/admin/rbac/roles/${roleId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deleteRole(roleId: string) {
  return apiFetch<{ success: boolean }>(`/admin/rbac/roles/${roleId}`, {
    method: "DELETE",
  });
}
