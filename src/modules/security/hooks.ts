"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as api from "./api";
import type { SecuritySignalsQuery, SecuritySummaryQuery } from "./api";

const signalsKey = (query: SecuritySignalsQuery) => [
  "admin",
  "security",
  "signals",
  query.noteId ?? "",
  query.userId ?? "",
  query.signalType ?? "",
  query.from ?? "",
  query.to ?? "",
  query.page ?? 1,
  query.pageSize ?? 20,
];

const summaryKey = (query: SecuritySummaryQuery) => [
  "admin",
  "security",
  "summary",
  query.from ?? "",
  query.to ?? "",
  query.limit ?? 5,
];

export function useSecuritySignals(query: SecuritySignalsQuery) {
  return useQuery({
    queryKey: signalsKey(query),
    queryFn: () => api.listSecuritySignals(query),
  });
}

export function useSecuritySummary(query: SecuritySummaryQuery) {
  return useQuery({
    queryKey: summaryKey(query),
    queryFn: () => api.getSecuritySummary(query),
  });
}

export function useSecurityProfile(userId?: string, limit = 20) {
  return useQuery({
    queryKey: ["admin", "security", "profile", userId, limit],
    queryFn: () => api.getUserSecurityProfile(userId as string, limit),
    enabled: Boolean(userId),
  });
}

export function useRevokeSession(userId?: string, query?: SecuritySignalsQuery) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (sessionId: string) => api.revokeSession(sessionId),
    onSuccess: async () => {
      if (query) {
        await queryClient.invalidateQueries({ queryKey: signalsKey(query) });
      }
      if (userId) {
        await queryClient.invalidateQueries({
          queryKey: ["admin", "security", "profile", userId],
        });
      }
    },
  });
}

export function useRevokeNoteSessions(query?: SecuritySignalsQuery) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (noteId: string) => api.revokeNoteSessions(noteId),
    onSuccess: async () => {
      if (query) {
        await queryClient.invalidateQueries({ queryKey: signalsKey(query) });
      }
      await queryClient.invalidateQueries({ queryKey: ["admin", "security", "summary"] });
    },
  });
}

export function useBanUserForNote(userId?: string, query?: SecuritySignalsQuery) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      noteId,
      targetUserId,
      reason,
    }: {
      noteId: string;
      targetUserId: string;
      reason?: string;
    }) => api.banUserForNote(noteId, targetUserId, reason),
    onSuccess: async () => {
      if (query) {
        await queryClient.invalidateQueries({ queryKey: signalsKey(query) });
      }
      if (userId) {
        await queryClient.invalidateQueries({
          queryKey: ["admin", "security", "profile", userId],
        });
      }
    },
  });
}

export function useUnbanUserForNote(userId?: string, query?: SecuritySignalsQuery) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ noteId, targetUserId }: { noteId: string; targetUserId: string }) =>
      api.unbanUserForNote(noteId, targetUserId),
    onSuccess: async () => {
      if (query) {
        await queryClient.invalidateQueries({ queryKey: signalsKey(query) });
      }
      if (userId) {
        await queryClient.invalidateQueries({
          queryKey: ["admin", "security", "profile", userId],
        });
      }
    },
  });
}
