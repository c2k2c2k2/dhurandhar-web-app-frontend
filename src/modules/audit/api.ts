"use client";

import { apiFetch } from "@/lib/api/client";
import type { AuditLogResponse } from "./types";

export type AuditQuery = {
  actorUserId?: string;
  action?: string;
  resourceType?: string;
  resourceId?: string;
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
};

function buildQuery(query: AuditQuery) {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    params.set(key, String(value));
  });
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export async function listAuditLogs(query: AuditQuery) {
  return apiFetch<AuditLogResponse>(`/admin/audit${buildQuery(query)}`, {
    method: "GET",
  });
}
