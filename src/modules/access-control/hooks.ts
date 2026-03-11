"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as api from "./api";

const permissionsKey = ["admin", "rbac", "permissions"];
const rolesKey = (query: api.RoleListQuery) => [
  "admin",
  "rbac",
  "roles",
  query.page ?? 1,
  query.pageSize ?? 20,
];

export function useAccessPermissions(enabled = true) {
  return useQuery({
    queryKey: permissionsKey,
    queryFn: api.listPermissions,
    enabled,
  });
}

export function useAccessRoles(query: api.RoleListQuery = {}, enabled = true) {
  return useQuery({
    queryKey: rolesKey(query),
    queryFn: () => api.listRoles(query),
    enabled,
  });
}

export function useCreateAccessRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.createRole,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "rbac", "roles"] });
    },
  });
}

export function useUpdateAccessRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ roleId, payload }: { roleId: string; payload: api.RolePayload }) =>
      api.updateRole(roleId, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "rbac", "roles"] });
    },
  });
}

export function useDeleteAccessRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (roleId: string) => api.deleteRole(roleId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "rbac", "roles"] });
    },
  });
}
