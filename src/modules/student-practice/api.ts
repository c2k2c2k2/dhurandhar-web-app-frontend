import { apiFetch } from "@/lib/api/client";
import type {
  PracticeAnswerPayload,
  PracticeProgress,
  PracticeQuestionResponse,
  PracticeSession,
  PracticeStartInput,
  PracticeWeakQuestion,
} from "@/modules/student-practice/types";

export async function startPractice(input: PracticeStartInput) {
  return apiFetch<PracticeSession>("/practice/start", {
    method: "POST",
    body: JSON.stringify({
      subjectId: input.subjectId,
      topicId: input.topicId,
      configJson: {
        count: input.count,
        difficulty: input.difficulty,
      },
    }),
  });
}

export async function endPractice(sessionId: string) {
  return apiFetch<PracticeSession>(`/practice/${sessionId}/end`, {
    method: "POST",
  });
}

export async function getNextQuestions(sessionId: string, limit?: number) {
  const query = limit ? `?limit=${limit}` : "";
  return apiFetch<PracticeQuestionResponse>(
    `/practice/${sessionId}/next${query}`,
    { method: "GET" }
  );
}

export async function submitAnswer(sessionId: string, payload: PracticeAnswerPayload) {
  return apiFetch<{ success: boolean }>(`/practice/${sessionId}/answer`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function revealExplanation(sessionId: string, payload: PracticeAnswerPayload) {
  return apiFetch<{ success: boolean }>(`/practice/${sessionId}/reveal`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getPracticeProgress() {
  return apiFetch<PracticeProgress>("/practice/progress", { method: "GET" });
}

export async function getWeakQuestions(limit = 8) {
  return apiFetch<PracticeWeakQuestion[]>(
    `/practice/weak-questions?limit=${limit}`,
    { method: "GET" }
  );
}

export async function getPracticeTrend(days = 7) {
  return apiFetch<Array<{ date: string; total: number; correct: number }>>(
    `/practice/trend?days=${days}`,
    { method: "GET" }
  );
}
