"use client";

import { useQuery } from "@tanstack/react-query";
import * as api from "./api";
import type { AuditQuery } from "./api";

const auditKey = (query: AuditQuery) => [
  "admin",
  "audit",
  query.actorUserId ?? "",
  query.action ?? "",
  query.resourceType ?? "",
  query.resourceId ?? "",
  query.from ?? "",
  query.to ?? "",
  query.page ?? 1,
  query.pageSize ?? 20,
];

export function useAuditLogs(query: AuditQuery) {
  return useQuery({
    queryKey: auditKey(query),
    queryFn: () => api.listAuditLogs(query),
  });
}
