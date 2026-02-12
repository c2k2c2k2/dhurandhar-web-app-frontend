import { apiFetch } from "@/lib/api/client";
import type { StudentMe } from "@/modules/student-auth/types";
import type {
  NoteProgressItem,
  Paginated,
  PracticeTopicsResponse,
  StudentSummary,
  TestSummary,
} from "@/modules/student-profile/types";
import type { PracticeProgress } from "@/modules/student-practice/types";

export async function getProfile() {
  return apiFetch<StudentMe>("/users/me", { method: "GET" });
}

export async function getSummary() {
  return apiFetch<StudentSummary>("/analytics/me/summary", { method: "GET" });
}

export async function getNotesProgress(params?: {
  status?: "completed" | "in-progress";
  subjectId?: string;
  topicId?: string;
  page?: number;
  pageSize?: number;
}) {
  const query = new URLSearchParams();
  if (params?.status) query.set("status", params.status);
  if (params?.subjectId) query.set("subjectId", params.subjectId);
  if (params?.topicId) query.set("topicId", params.topicId);
  if (params?.page) query.set("page", String(params.page));
  if (params?.pageSize) query.set("pageSize", String(params.pageSize));
  const suffix = query.toString();
  return apiFetch<Paginated<NoteProgressItem>>(
    `/analytics/me/notes${suffix ? `?${suffix}` : ""}`,
    { method: "GET" }
  );
}

export async function getPracticeTopics(page = 1, pageSize = 10) {
  return apiFetch<PracticeTopicsResponse>(
    `/analytics/me/practice/topics?page=${page}&pageSize=${pageSize}`,
    { method: "GET" }
  );
}

export async function getSubjectProgress() {
  return apiFetch<PracticeProgress>("/practice/progress", { method: "GET" });
}

export async function getTopicProgress(page = 1, pageSize = 10) {
  return getPracticeTopics(page, pageSize);
}

export async function getTestSummary() {
  return apiFetch<TestSummary>("/analytics/me/tests/summary", { method: "GET" });
}
