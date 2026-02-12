"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as api from "./api";
import type { TemplatesQuery, MessagesQuery, BroadcastsQuery } from "./api";

const templatesKey = (query: TemplatesQuery) => [
  "admin",
  "notifications",
  "templates",
  query.channel ?? "",
  query.search ?? "",
  query.isActive ?? "",
];

export function useNotificationTemplates(query: TemplatesQuery) {
  return useQuery({
    queryKey: templatesKey(query),
    queryFn: () => api.listTemplates(query),
  });
}

export function useCreateTemplate(query: TemplatesQuery) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.createTemplate,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: templatesKey(query) });
    },
  });
}

export function useUpdateTemplate(query: TemplatesQuery) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      templateId,
      payload,
    }: {
      templateId: string;
      payload: api.TemplateUpdatePayload;
    }) => api.updateTemplate(templateId, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: templatesKey(query) });
    },
  });
}

const messagesKey = (query: MessagesQuery) => [
  "admin",
  "notifications",
  "messages",
  query.status ?? "",
  query.channel ?? "",
  query.userId ?? "",
  query.templateId ?? "",
  query.from ?? "",
  query.to ?? "",
  query.page ?? 1,
  query.pageSize ?? 20,
];

export function useNotificationMessages(query: MessagesQuery) {
  return useQuery({
    queryKey: messagesKey(query),
    queryFn: () => api.listMessages(query),
  });
}

export function useResendMessage(query: MessagesQuery) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (messageId: string) => api.resendMessage(messageId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: messagesKey(query) });
    },
  });
}

const broadcastsKey = (query: BroadcastsQuery) => [
  "admin",
  "notifications",
  "broadcasts",
  query.channel ?? "",
  query.status ?? "",
  query.page ?? 1,
  query.pageSize ?? 20,
];

export function useNotificationBroadcasts(query: BroadcastsQuery) {
  return useQuery({
    queryKey: broadcastsKey(query),
    queryFn: () => api.listBroadcasts(query),
  });
}

export function useCreateBroadcast(query: BroadcastsQuery) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.createBroadcast,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: broadcastsKey(query) });
    },
  });
}

export function useScheduleBroadcast(query: BroadcastsQuery) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      broadcastId,
      scheduledAt,
    }: {
      broadcastId: string;
      scheduledAt?: string;
    }) => api.scheduleBroadcast(broadcastId, scheduledAt),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: broadcastsKey(query) });
    },
  });
}

export function useCancelBroadcast(query: BroadcastsQuery) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (broadcastId: string) => api.cancelBroadcast(broadcastId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: broadcastsKey(query) });
    },
  });
}
