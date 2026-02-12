import type { QuestionItem } from "@/modules/questions/types";
import type { TestItem } from "@/modules/tests/types";

export type AttemptStatus = "STARTED" | "IN_PROGRESS" | "SUBMITTED" | "EVALUATED";

export type AttemptItem = {
  id: string;
  testId: string;
  userId?: string;
  status: AttemptStatus;
  startedAt?: string;
  submittedAt?: string | null;
  answersJson?: Record<string, unknown> | null;
  scoreJson?: Record<string, unknown> | null;
  totalScore?: number | null;
  createdAt?: string;
  updatedAt?: string;
  test?: TestItem;
};

export type AttemptDetail = AttemptItem & {
  test: TestItem;
  questions: QuestionItem[];
};

export type AttemptListResponse = {
  data: AttemptItem[];
  total: number;
  page: number;
  pageSize: number;
};

export type StartAttemptResponse = {
  attemptId: string;
  testId: string;
  questions: QuestionItem[];
};

export type SubmitAttemptResponse = {
  totalScore: number;
  scoreJson: Record<string, unknown>;
};

export type AttemptState = {
  answers: Record<string, unknown>;
  currentIndex?: number;
};

export type AttemptResult = SubmitAttemptResponse;
