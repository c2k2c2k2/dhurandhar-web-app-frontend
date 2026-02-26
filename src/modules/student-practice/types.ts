import type { QuestionDifficulty, QuestionItem } from "@/modules/questions/types";

export type PracticeMode = "PRACTICE";
export type PracticeSessionStatus = "ACTIVE" | "ENDED";

export type PracticeSession = {
  id: string;
  userId?: string;
  subjectId?: string | null;
  topicId?: string | null;
  mode: PracticeMode;
  status: PracticeSessionStatus;
  configJson?: Record<string, unknown> | null;
  startedAt?: string;
  endedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type PracticeStartInput = {
  subjectId?: string;
  topicId?: string;
  difficulty?: QuestionDifficulty;
  count?: number;
};

export type PracticeQuestionResponse = {
  sessionId: string;
  questions: QuestionItem[];
};

export type PracticeAnswerPayload = {
  questionId: string;
  answerJson?: unknown;
  isCorrect?: boolean;
};

export type PracticeAnswerResult = {
  questionId: string;
  eventType: "SERVED" | "ANSWERED" | "REVEALED";
  isCorrect: boolean | null;
  correctAnswerJson?: unknown | null;
};

export type PracticeAnswerResponse = {
  success: boolean;
  results?: PracticeAnswerResult[];
};

export type PracticeProgressSubject = {
  subjectId: string;
  totalAnswered: number;
  correctCount: number;
};

export type PracticeTopicProgress = {
  id: string;
  userId: string;
  topicId: string;
  totalAnswered: number;
  correctCount: number;
  updatedAt?: string;
  topic: {
    id: string;
    name: string;
    subjectId: string;
    subject: { id: string; name: string };
  };
};

export type PracticeProgress = {
  topics: PracticeTopicProgress[];
  subjects: PracticeProgressSubject[];
};

export type PracticeWeakQuestion = {
  question: QuestionItem;
  wrongCount: number;
  correctCount: number;
  lastAnsweredAt?: string | null;
};
