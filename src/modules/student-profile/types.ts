import type { PracticeTopicProgress } from "@/modules/student-practice/types";

export type StudentSummary = {
  notes: {
    total: number;
    completed: number;
    inProgress: number;
    completionRate: number;
    averageCompletion: number;
    lastUpdatedAt?: string | null;
  };
  practice: {
    answered: number;
    correct: number;
    wrong: number;
    accuracy: number;
    lastAnsweredAt?: string | null;
  };
  tests: {
    attempts: number;
    evaluated: number;
    averageScore: number;
    lastAttemptAt?: string | null;
  };
};

export type Paginated<T> = {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
};

export type NoteProgressItem = {
  id: string;
  completionPercent?: number | null;
  lastPage?: number | null;
  updatedAt?: string;
  note: {
    id: string;
    title: string;
    subjectId: string;
    topics?: { topic: { id: string; name: string } }[];
  };
};

export type PracticeTopicsResponse = Paginated<PracticeTopicProgress>;

export type TestSummary = {
  attempts: number;
  evaluated: number;
  averageScore: number;
  bestScore: number;
  lastAttempt?: { createdAt?: string; status?: string; totalScore?: number } | null;
};
