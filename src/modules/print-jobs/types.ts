"use client";

import type { QuestionDifficulty } from "@/modules/questions/types";

export type PrintJobType = "TEST" | "PRACTICE" | "CUSTOM";

export type PrintJobStatus =
  | "QUEUED"
  | "RUNNING"
  | "DONE"
  | "FAILED"
  | "CANCELLED";

export type PrintJobConfig = {
  type: PrintJobType;
  title?: string;
  subtitle?: string;
  includeAnswerKey?: boolean;
  testId?: string;
  questionIds?: string[];
};

export type PrintJobItem = {
  id: string;
  type: PrintJobType;
  status: PrintJobStatus;
  configJson: PrintJobConfig;
  outputFileAssetId?: string | null;
  errorMessage?: string | null;
  createdAt?: string;
  updatedAt?: string;
  startedAt?: string | null;
  completedAt?: string | null;
};

export type PrintJobListResponse = {
  data: PrintJobItem[];
  total: number;
  page: number;
  pageSize: number;
};

export type PrintJobCreateInput = {
  type: PrintJobType;
  testId?: string;
  questionIds?: string[];
  includeAnswerKey?: boolean;
  title?: string;
  subtitle?: string;
};

export type PrintTestJobInput = {
  includeAnswerKey?: boolean;
  title?: string;
  subtitle?: string;
};

export type PrintPracticeJobInput = {
  count: number;
  subjectId?: string;
  topicIds?: string[];
  difficulty?: QuestionDifficulty;
  includeAnswerKey?: boolean;
  title?: string;
  subtitle?: string;
};

export type PrintJobDownload = {
  fileAssetId: string;
  fileName?: string;
  downloadUrl: string;
  expiresInSeconds: number;
};
