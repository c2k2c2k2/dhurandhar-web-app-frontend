import type { QuestionType } from "@/modules/questions/types";

export type AnswerValue =
  | { optionIndex: number }
  | { optionIndexes: number[] }
  | { value: string | number | boolean };

export type AnswerState = Record<string, AnswerValue | undefined>;

export function isMultiChoice(type: QuestionType) {
  return type === "MULTI_CHOICE";
}

export function isChoiceQuestion(type: QuestionType) {
  return ["SINGLE_CHOICE", "MULTI_CHOICE", "TRUE_FALSE"].includes(type);
}
