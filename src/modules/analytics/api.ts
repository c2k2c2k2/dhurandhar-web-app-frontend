"use client";

import { apiFetch } from "@/lib/api/client";
import type {
  AnalyticsOverview,
  CoverageResponse,
  RevenueResponse,
  EngagementResponse,
} from "./types";

export type AnalyticsRangeQuery = {
  from?: string;
  to?: string;
};

export type AnalyticsCoverageQuery = {
  subjectId?: string;
  page?: number;
  pageSize?: number;
};

export type AnalyticsRevenueQuery = AnalyticsRangeQuery & {
  period?: string;
};

export type AnalyticsEngagementQuery = {
  days?: number;
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

export async function getAnalyticsOverview(query: AnalyticsRangeQuery) {
  return apiFetch<AnalyticsOverview>(
    `/admin/analytics/overview${buildQuery(query)}`,
    { method: "GET" }
  );
}

export async function getAnalyticsCoverage(query: AnalyticsCoverageQuery) {
  return apiFetch<CoverageResponse>(
    `/admin/analytics/coverage${buildQuery(query)}`,
    { method: "GET" }
  );
}

export async function getAnalyticsRevenue(query: AnalyticsRevenueQuery) {
  return apiFetch<RevenueResponse>(
    `/admin/analytics/revenue${buildQuery(query)}`,
    { method: "GET" }
  );
}

export async function getAnalyticsEngagement(query: AnalyticsEngagementQuery) {
  return apiFetch<EngagementResponse>(
    `/admin/analytics/engagement${buildQuery(query)}`,
    { method: "GET" }
  );
}
