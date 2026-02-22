"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as api from "./api";
import type { TestCreateInput } from "./types";
import type { TestFilters } from "./api";

const testsKey = (filters: TestFilters) => ["admin", "tests", filters];

export function useTests(filters: TestFilters = {}) {
  return useQuery({
    queryKey: testsKey(filters),
    queryFn: () => api.listTests(filters),
  });
}

export function useTestPresets() {
  return useQuery({
    queryKey: ["admin", "tests", "presets"],
    queryFn: api.listTestPresets,
  });
}

export function useTest(testId?: string) {
  return useQuery({
    queryKey: ["admin", "tests", "detail", testId],
    queryFn: async () => {
      const response = await api.listTests({ page: 1, pageSize: 200 });
      return response.data.find((test) => test.id === testId) || null;
    },
    enabled: Boolean(testId),
  });
}

export function useCreateTest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: TestCreateInput) => api.createTest(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "tests"] });
    },
  });
}

export function useUpdateTest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      testId,
      input,
    }: {
      testId: string;
      input: Partial<TestCreateInput>;
    }) => api.updateTest(testId, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "tests"] });
    },
  });
}

export function usePublishTest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (testId: string) => api.publishTest(testId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "tests"] });
    },
  });
}

export function useUnpublishTest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (testId: string) => api.unpublishTest(testId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "tests"] });
    },
  });
}
