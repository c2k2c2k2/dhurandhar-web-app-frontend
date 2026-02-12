"use client";

import { apiFetch } from "@/lib/api/client";
import type {
  NotificationTemplate,
  NotificationMessageResponse,
  NotificationBroadcastResponse,
  NotificationMessage,
  NotificationBroadcast,
} from "./types";

export type TemplatesQuery = {
  channel?: string;
  search?: string;
  isActive?: string;
};

export type MessagesQuery = {
  status?: string;
  channel?: string;
  userId?: string;
  templateId?: string;
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
};

export type BroadcastsQuery = {
  channel?: string;
  status?: string;
  page?: number;
  pageSize?: number;
};

export type TemplatePayload = {
  key: string;
  channel: string;
  subject?: string;
  bodyJson: Record<string, unknown>;
  variablesJson?: string[];
  isActive?: boolean;
};

export type TemplateUpdatePayload = Partial<TemplatePayload>;

export type BroadcastCreatePayload = {
  title: string;
  channel: string;
  templateId?: string;
  audienceJson: Record<string, unknown>;
  scheduledAt?: string;
  status?: string;
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

export async function listTemplates(query: TemplatesQuery) {
  return apiFetch<NotificationTemplate[]>(
    `/admin/notifications/templates${buildQuery(query)}`,
    { method: "GET" }
  );
}

export async function createTemplate(payload: TemplatePayload) {
  return apiFetch<NotificationTemplate>("/admin/notifications/templates", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateTemplate(templateId: string, payload: TemplateUpdatePayload) {
  return apiFetch<NotificationTemplate>(
    `/admin/notifications/templates/${templateId}`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    }
  );
}

export async function listMessages(query: MessagesQuery) {
  return apiFetch<NotificationMessageResponse>(
    `/admin/notifications/messages${buildQuery(query)}`,
    { method: "GET" }
  );
}

export async function resendMessage(messageId: string) {
  return apiFetch<NotificationMessage>(
    `/admin/notifications/messages/${messageId}/resend`,
    { method: "POST" }
  );
}

export async function listBroadcasts(query: BroadcastsQuery) {
  return apiFetch<NotificationBroadcastResponse>(
    `/admin/notifications/broadcasts${buildQuery(query)}`,
    { method: "GET" }
  );
}

export async function createBroadcast(payload: BroadcastCreatePayload) {
  return apiFetch<NotificationBroadcast>("/admin/notifications/broadcasts", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function scheduleBroadcast(broadcastId: string, scheduledAt?: string) {
  return apiFetch<NotificationBroadcast>(
    `/admin/notifications/broadcasts/${broadcastId}/schedule`,
    {
      method: "POST",
      body: JSON.stringify(scheduledAt ? { scheduledAt } : {}),
    }
  );
}

export async function cancelBroadcast(broadcastId: string) {
  return apiFetch<NotificationBroadcast>(
    `/admin/notifications/broadcasts/${broadcastId}/cancel`,
    { method: "POST" }
  );
}
