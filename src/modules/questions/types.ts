"use client";

export type QuestionType =
  | "SINGLE_CHOICE"
  | "MULTI_CHOICE"
  | "TRUE_FALSE"
  | "INTEGER"
  | "SHORT_ANSWER";

export type QuestionDifficulty = "EASY" | "MEDIUM" | "HARD";

export type QuestionContentBlock = {
  text?: string;
  imageAssetId?: string;
  assetId?: string;
  blocks?: QuestionContentBlock[];
};

export type QuestionOptions =
  | { options: QuestionContentBlock[] }
  | QuestionContentBlock[];

export type QuestionAnswer =
  | { optionIndex: number }
  | { optionIndexes: number[] }
  | { value: string | number | boolean };

export type QuestionItem = {
  id: string;
  subjectId: string;
  topicId?: string | null;
  type: QuestionType;
  difficulty?: QuestionDifficulty | null;
  statementJson: QuestionContentBlock | string;
  optionsJson?: QuestionOptions | null;
  explanationJson?: QuestionContentBlock | string | null;
  correctAnswerJson?: QuestionAnswer | null;
  isPublished: boolean;
  hasMedia?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type QuestionAsset = {
  id: string;
  fileName?: string;
  contentType?: string;
  sizeBytes?: number;
  purpose?: string;
  confirmedAt?: string | null;
};

export type QuestionDetail = QuestionItem & {
  assets?: QuestionAsset[];
};

export type QuestionCreateInput = {
  subjectId: string;
  topicId?: string;
  type: QuestionType;
  difficulty?: QuestionDifficulty;
  statementJson: QuestionContentBlock | string;
  optionsJson?: QuestionOptions;
  explanationJson?: QuestionContentBlock | string;
  correctAnswerJson?: QuestionAnswer;
  isPublished?: boolean;
};

export type QuestionUpdateInput = Partial<QuestionCreateInput>;
