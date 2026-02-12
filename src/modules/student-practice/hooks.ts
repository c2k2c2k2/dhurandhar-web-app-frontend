import { useMutation, useQuery } from "@tanstack/react-query";
import * as api from "@/modules/student-practice/api";
import type { PracticeStartInput } from "@/modules/student-practice/types";

export function useStartPractice() {
  return useMutation({ mutationFn: (input: PracticeStartInput) => api.startPractice(input) });
}

export function useNextPracticeQuestions(sessionId?: string, limit?: number) {
  return useQuery({
    queryKey: ["student", "practice", "next", sessionId, limit],
    queryFn: () => api.getNextQuestions(sessionId as string, limit),
    enabled: Boolean(sessionId),
  });
}

export function usePracticeProgress(enabled = true) {
  return useQuery({
    queryKey: ["student", "practice", "progress"],
    queryFn: api.getPracticeProgress,
    enabled,
  });
}

export function usePracticeTrend(days = 7, enabled = true) {
  return useQuery({
    queryKey: ["student", "practice", "trend", days],
    queryFn: () => api.getPracticeTrend(days),
    enabled,
  });
}

export function usePracticeWeakQuestions(limit = 8, enabled = true) {
  return useQuery({
    queryKey: ["student", "practice", "weak", limit],
    queryFn: () => api.getWeakQuestions(limit),
    enabled,
  });
}

export function useSubmitPracticeAnswer() {
  return useMutation({
    mutationFn: ({ sessionId, payload }: { sessionId: string; payload: { questionId: string; answerJson?: unknown; isCorrect?: boolean } }) =>
      api.submitAnswer(sessionId, payload),
  });
}

export function useEndPractice() {
  return useMutation({ mutationFn: (sessionId: string) => api.endPractice(sessionId) });
}
