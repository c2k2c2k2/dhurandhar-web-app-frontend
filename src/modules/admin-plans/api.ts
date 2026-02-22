"use client";

import { apiFetch } from "@/lib/api/client";
import type {
  AdminPlan,
  AdminPlanInput,
  AdminPlanList,
  AdminPlanUpdateInput,
} from "./types";

export type AdminPlansQuery = {
  isActive?: string;
  page?: number;
  pageSize?: number;
};

function buildQuery(query: AdminPlansQuery) {
  const params = new URLSearchParams();
  if (query.isActive) params.set("isActive", query.isActive);
  if (query.page) params.set("page", String(query.page));
  if (query.pageSize) params.set("pageSize", String(query.pageSize));
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export async function listAdminPlans(query: AdminPlansQuery) {
  return apiFetch<AdminPlanList>(`/admin/plans${buildQuery(query)}`, {
    method: "GET",
  });
}

export async function createAdminPlan(payload: AdminPlanInput) {
  return apiFetch<AdminPlan>("/admin/plans", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateAdminPlan(
  planId: string,
  payload: AdminPlanUpdateInput,
) {
  return apiFetch<AdminPlan>(`/admin/plans/${planId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}
