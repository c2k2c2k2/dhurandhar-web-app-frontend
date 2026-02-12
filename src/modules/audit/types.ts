"use client";

export type AuditActor = {
  id: string;
  email?: string | null;
  fullName?: string | null;
};

export type AuditLog = {
  id: string;
  actorUserId?: string | null;
  action?: string;
  resourceType?: string | null;
  resourceId?: string | null;
  metaJson?: unknown;
  createdAt?: string;
  actorUser?: AuditActor | null;
};

export type AuditLogResponse = {
  data: AuditLog[];
  total: number;
  page: number;
  pageSize: number;
};
