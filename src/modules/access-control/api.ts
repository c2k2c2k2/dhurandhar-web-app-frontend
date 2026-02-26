"use client";

import { apiFetch } from "@/lib/api/client";
import type { AccessPermission, AccessRole, RolePayload } from "./types";

export type { RolePayload };

export async function listPermissions() {
  return apiFetch<AccessPermission[]>("/admin/rbac/permissions", {
    method: "GET",
  });
}

export async function listRoles() {
  return apiFetch<AccessRole[]>("/admin/rbac/roles", {
    method: "GET",
  });
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
