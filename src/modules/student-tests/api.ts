import { apiFetch } from "@/lib/api/client";
import type { TestListResponse, TestItem } from "@/modules/tests/types";
import type {
  AttemptDetail,
  AttemptListResponse,
  StartAttemptResponse,
  SubmitAttemptResponse,
} from "@/modules/student-tests/types";

export async function listTests(page = 1, pageSize = 20) {
  return apiFetch<TestListResponse>(`/tests?page=${page}&pageSize=${pageSize}`, {
    method: "GET",
    auth: false,
  });
}

export async function getTest(testId: string) {
  return apiFetch<TestItem>(`/tests/${testId}`, { method: "GET", auth: false });
}

export async function startAttempt(testId: string) {
  return apiFetch<StartAttemptResponse>(`/tests/${testId}/start`, {
    method: "POST",
  });
}

export async function saveAttempt(attemptId: string, answersJson: Record<string, unknown>) {
  return apiFetch<{ success: boolean }>(`/attempts/${attemptId}/save`, {
    method: "PATCH",
    body: JSON.stringify({ answersJson }),
  });
}

export async function submitAttempt(attemptId: string, answersJson: Record<string, unknown>) {
  return apiFetch<SubmitAttemptResponse>(`/attempts/${attemptId}/submit`, {
    method: "POST",
    body: JSON.stringify({ answersJson }),
  });
}

export async function getAttempt(attemptId: string) {
  return apiFetch<AttemptDetail>(`/attempts/${attemptId}`, { method: "GET" });
}

export async function listAttempts(page = 1, pageSize = 10) {
  return apiFetch<AttemptListResponse>(
    `/attempts/me?page=${page}&pageSize=${pageSize}`,
    { method: "GET" }
  );
}
