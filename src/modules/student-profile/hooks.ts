import { useQuery } from "@tanstack/react-query";
import * as api from "@/modules/student-profile/api";

export function useStudentProfile() {
  return useQuery({
    queryKey: ["student", "profile"],
    queryFn: api.getProfile,
  });
}

export function useStudentSummary() {
  return useQuery({
    queryKey: ["student", "summary"],
    queryFn: api.getSummary,
  });
}

export function useNotesProgress(params?: {
  status?: "completed" | "in-progress";
  subjectId?: string;
  topicId?: string;
  page?: number;
  pageSize?: number;
}) {
  return useQuery({
    queryKey: ["student", "notes", "progress", params],
    queryFn: () => api.getNotesProgress(params),
  });
}

export function usePracticeTopics(page = 1, pageSize = 10) {
  return useQuery({
    queryKey: ["student", "practice", "topics", page, pageSize],
    queryFn: () => api.getPracticeTopics(page, pageSize),
  });
}

export function useSubjectProgress() {
  return useQuery({
    queryKey: ["student", "practice", "subject-progress"],
    queryFn: api.getSubjectProgress,
  });
}

export function useTopicProgress(page = 1, pageSize = 10) {
  return useQuery({
    queryKey: ["student", "practice", "topic-progress", page, pageSize],
    queryFn: () => api.getTopicProgress(page, pageSize),
  });
}

export function useTestSummary() {
  return useQuery({
    queryKey: ["student", "tests", "summary"],
    queryFn: api.getTestSummary,
  });
}
