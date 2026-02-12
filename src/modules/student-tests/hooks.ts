import { useMutation, useQuery } from "@tanstack/react-query";
import * as api from "@/modules/student-tests/api";

export function useTests(page = 1, pageSize = 20) {
  return useQuery({
    queryKey: ["student", "tests", page, pageSize],
    queryFn: () => api.listTests(page, pageSize),
  });
}

export function useTest(testId?: string) {
  return useQuery({
    queryKey: ["student", "tests", testId],
    queryFn: () => api.getTest(testId as string),
    enabled: Boolean(testId),
  });
}

export function useStartAttempt() {
  return useMutation({ mutationFn: (testId: string) => api.startAttempt(testId) });
}

export function useAttempt(attemptId?: string) {
  return useQuery({
    queryKey: ["student", "attempt", attemptId],
    queryFn: () => api.getAttempt(attemptId as string),
    enabled: Boolean(attemptId),
  });
}

export function useAttempts(page = 1, pageSize = 10) {
  return useQuery({
    queryKey: ["student", "attempts", page, pageSize],
    queryFn: () => api.listAttempts(page, pageSize),
  });
}

export function useSaveAttempt() {
  return useMutation({
    mutationFn: ({ attemptId, answers }: { attemptId: string; answers: Record<string, unknown> }) =>
      api.saveAttempt(attemptId, answers),
  });
}

export function useSubmitAttempt() {
  return useMutation({
    mutationFn: ({ attemptId, answers }: { attemptId: string; answers: Record<string, unknown> }) =>
      api.submitAttempt(attemptId, answers),
  });
}
