"use client";

import { useQuery } from "@tanstack/react-query";
import * as api from "./api";
import type {
  AnalyticsRangeQuery,
  AnalyticsCoverageQuery,
  AnalyticsRevenueQuery,
  AnalyticsEngagementQuery,
} from "./api";

export function useAnalyticsOverview(query: AnalyticsRangeQuery) {
  return useQuery({
    queryKey: ["admin", "analytics", "overview", query.from ?? "", query.to ?? ""],
    queryFn: () => api.getAnalyticsOverview(query),
  });
}

export function useAnalyticsCoverage(query: AnalyticsCoverageQuery) {
  return useQuery({
    queryKey: [
      "admin",
      "analytics",
      "coverage",
      query.subjectId ?? "",
      query.page ?? 1,
      query.pageSize ?? 50,
    ],
    queryFn: () => api.getAnalyticsCoverage(query),
  });
}

export function useAnalyticsRevenue(query: AnalyticsRevenueQuery) {
  return useQuery({
    queryKey: [
      "admin",
      "analytics",
      "revenue",
      query.from ?? "",
      query.to ?? "",
      query.period ?? "day",
    ],
    queryFn: () => api.getAnalyticsRevenue(query),
  });
}

export function useAnalyticsEngagement(query: AnalyticsEngagementQuery) {
  return useQuery({
    queryKey: ["admin", "analytics", "engagement", query.days ?? 30],
    queryFn: () => api.getAnalyticsEngagement(query),
  });
}
