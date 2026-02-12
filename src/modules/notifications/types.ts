"use client";

export type NotificationTemplate = {
  id: string;
  key: string;
  channel: string;
  subject?: string | null;
  bodyJson?: unknown;
  variablesJson?: string[] | null;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type NotificationMessage = {
  id: string;
  status?: string;
  channel?: string;
  userId?: string | null;
  templateId?: string | null;
  attempts?: number;
  createdAt?: string;
  template?: { id: string; key?: string; subject?: string | null; channel?: string };
  user?: { id: string; email?: string | null; fullName?: string | null };
};

export type NotificationBroadcast = {
  id: string;
  title?: string | null;
  channel?: string;
  status?: string;
  scheduledAt?: string | null;
  createdAt?: string;
  template?: { id: string; key?: string; subject?: string | null; channel?: string };
  creator?: { id: string; email?: string | null; fullName?: string | null };
};

export type NotificationMessageResponse = {
  data: NotificationMessage[];
  total: number;
  page: number;
  pageSize: number;
};

export type NotificationBroadcastResponse = {
  data: NotificationBroadcast[];
  total: number;
  page: number;
  pageSize: number;
};
