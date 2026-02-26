"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as api from "./api";
import type { UsersQuery } from "./api";

const usersKey = (query: UsersQuery) => [
  "admin",
  "users",
  query.search ?? "",
  query.type ?? "",
  query.status ?? "",
  query.hasActiveSubscription ?? "",
  query.page ?? 1,
  query.pageSize ?? 20,
];

export function useUsers(query: UsersQuery) {
  return useQuery({
    queryKey: usersKey(query),
    queryFn: () => api.listUsers(query),
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: api.CreateUserPayload) => api.createUser(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
}

export function useUser(userId?: string) {
  return useQuery({
    queryKey: ["admin", "users", userId],
    queryFn: () => api.getUser(userId as string),
    enabled: Boolean(userId),
  });
}

export function useUpdateUser(userId?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: api.UpdateUserPayload) =>
      api.updateUser(userId as string, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      if (userId) {
        await queryClient.invalidateQueries({ queryKey: ["admin", "users", userId] });
      }
    },
  });
}

export function useBlockUser(query: UsersQuery) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, reason }: { userId: string; reason?: string }) =>
      api.blockUser(userId, reason),
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({ queryKey: usersKey(query) });
      await queryClient.invalidateQueries({
        queryKey: ["admin", "users", variables.userId],
      });
    },
  });
}

export function useUnblockUser(query: UsersQuery) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => api.unblockUser(userId),
    onSuccess: async (_, userId) => {
      await queryClient.invalidateQueries({ queryKey: usersKey(query) });
      await queryClient.invalidateQueries({ queryKey: ["admin", "users", userId] });
    },
  });
}

export function useForceLogout() {
  return useMutation({
    mutationFn: (userId: string) => api.forceLogout(userId),
  });
}

export function useGrantEntitlement(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: api.EntitlementPayload) =>
      api.grantEntitlement(userId, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "users", userId] });
    },
  });
}

export function useRevokeEntitlement(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: api.EntitlementPayload) =>
      api.revokeEntitlement(userId, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "users", userId] });
    },
  });
}

export function useActivateUserSubscription(userId?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: api.ActivateSubscriptionPayload & { userId?: string }) => {
      const targetUserId = userId ?? payload.userId;
      if (!targetUserId) {
        throw new Error("User id is required to activate subscription.");
      }
      const { userId: _ignoredUserId, ...body } = payload;
      return api.activateSubscription(targetUserId, body);
    },
    onSuccess: async (_, variables) => {
      const targetUserId = userId ?? variables.userId;
      if (targetUserId) {
        await queryClient.invalidateQueries({ queryKey: ["admin", "users", targetUserId] });
      }
      await queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      await queryClient.invalidateQueries({ queryKey: ["admin", "payments"] });
    },
  });
}
