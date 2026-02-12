"use client";

import { apiFetch } from "@/lib/api/client";
import type {
  PrintJobCreateInput,
  PrintJobDownload,
  PrintJobItem,
  PrintJobListResponse,
  PrintJobStatus,
  PrintJobType,
  PrintPracticeJobInput,
  PrintTestJobInput,
} from "./types";

export type PrintJobFilters = {
  status?: PrintJobStatus;
  type?: PrintJobType;
  page?: number;
  pageSize?: number;
};

function normalizeList(payload: unknown): PrintJobListResponse {
  if (payload && typeof payload === "object") {
    const typed = payload as Record<string, unknown>;
    if (Array.isArray(typed.data)) {
      return typed as PrintJobListResponse;
    }
    if (Array.isArray(typed.items)) {
      return {
        data: typed.items as PrintJobItem[],
        total: Number(typed.total ?? (typed.items as PrintJobItem[]).length),
        page: Number(typed.page ?? 1),
        pageSize: Number(typed.pageSize ?? (typed.items as PrintJobItem[]).length),
      };
    }
  }
  if (Array.isArray(payload)) {
    return {
      data: payload as PrintJobItem[],
      total: payload.length,
      page: 1,
      pageSize: payload.length,
    };
  }
  return { data: [], total: 0, page: 1, pageSize: 20 };
}

export async function listPrintJobs(filters: PrintJobFilters = {}) {
  const params = new URLSearchParams();
  if (filters.status) params.set("status", filters.status);
  if (filters.type) params.set("type", filters.type);
  if (filters.page) params.set("page", String(filters.page));
  if (filters.pageSize) params.set("pageSize", String(filters.pageSize));

  const queryString = params.toString();
  const data = await apiFetch<unknown>(
    `/admin/print-jobs${queryString ? `?${queryString}` : ""}`,
    { method: "GET" }
  );
  return normalizeList(data);
}

export async function createPrintJob(input: PrintJobCreateInput) {
  return apiFetch<PrintJobItem>("/admin/print-jobs", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function createTestPrintJob(testId: string, input: PrintTestJobInput) {
  return apiFetch<PrintJobItem>(`/admin/print/test/${testId}`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function createPracticePrintJob(input: PrintPracticeJobInput) {
  return apiFetch<PrintJobItem>("/admin/print/practice", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function getPrintJob(jobId: string) {
  return apiFetch<PrintJobItem>(`/admin/print-jobs/${jobId}`, { method: "GET" });
}

export async function getPrintJobDownload(jobId: string) {
  return apiFetch<PrintJobDownload>(`/admin/print-jobs/${jobId}/download`, {
    method: "GET",
  });
}

export async function retryPrintJob(jobId: string) {
  return apiFetch<PrintJobItem>(`/admin/print-jobs/${jobId}/retry`, {
    method: "POST",
  });
}

export async function cancelPrintJob(jobId: string) {
  return apiFetch<PrintJobItem>(`/admin/print-jobs/${jobId}/cancel`, {
    method: "POST",
  });
}
