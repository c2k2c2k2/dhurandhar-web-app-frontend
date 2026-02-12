export type ExamModuleKey = "notes" | "practice" | "tests";

export type ExamModuleAvailability = Record<ExamModuleKey, boolean>;

export type ExamCounts = {
  tests?: number;
  practice?: number;
  notes?: number;
};

export type ExamTopicGroup = {
  title: string;
  topics: string[];
};

export type ExamFaq = {
  question: string;
  answer: string;
};

export type ExamDetails = {
  id: string;
  name: string;
  slug: string;
  description: string;
  tags: string[];
  modulesAvailable: ExamModuleAvailability;
  counts?: ExamCounts;
  topics: ExamTopicGroup[];
  faqs: ExamFaq[];
};
