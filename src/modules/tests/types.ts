"use client";

export type TestType = "SUBJECT" | "COMBINED" | "CUSTOM";

export type TestDifficulty = "EASY" | "MEDIUM" | "HARD";

export type TestConfig = {
  questionIds?: string[];
  items?: { questionId: string; marks?: number }[];
  mixer?: {
    subjectId?: string;
    topicIds?: string[];
    difficulty?: TestDifficulty;
    count: number;
  };
  marksPerQuestion?: number;
};

export type TestItem = {
  id: string;
  subjectId?: string | null;
  title: string;
  description?: string | null;
  type: TestType;
  configJson: TestConfig;
  isPublished: boolean;
  startsAt?: string | null;
  endsAt?: string | null;
  publishedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type TestListResponse = {
  data: TestItem[];
  total: number;
  page: number;
  pageSize: number;
};

export type TestCreateInput = {
  subjectId?: string;
  title: string;
  description?: string;
  type: TestType;
  configJson: TestConfig;
  isPublished?: boolean;
  startsAt?: string;
  endsAt?: string;
};

export type TestUpdateInput = Partial<TestCreateInput>;
