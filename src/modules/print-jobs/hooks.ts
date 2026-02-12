"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as api from "./api";
import type { PrintJobCreateInput, PrintPracticeJobInput, PrintTestJobInput } from "./types";
import type { PrintJobFilters } from "./api";

const printJobsKey = (filters: PrintJobFilters) => ["admin", "print-jobs", filters];

export function usePrintJobs(filters: PrintJobFilters = {}) {
  return useQuery({
    queryKey: printJobsKey(filters),
    queryFn: () => api.listPrintJobs(filters),
  });
}

export function useCreatePrintJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: PrintJobCreateInput) => api.createPrintJob(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "print-jobs"] });
    },
  });
}

export function useCreateTestPrintJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      testId,
      input,
    }: {
      testId: string;
      input: PrintTestJobInput;
    }) => api.createTestPrintJob(testId, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "print-jobs"] });
    },
  });
}

export function useCreatePracticePrintJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: PrintPracticeJobInput) => api.createPracticePrintJob(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "print-jobs"] });
    },
  });
}

export function usePrintJobDownload() {
  return useMutation({
    mutationFn: (jobId: string) => api.getPrintJobDownload(jobId),
  });
}

export function useRetryPrintJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (jobId: string) => api.retryPrintJob(jobId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "print-jobs"] });
    },
  });
}

export function useCancelPrintJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (jobId: string) => api.cancelPrintJob(jobId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "print-jobs"] });
    },
  });
}
