"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as api from "./api";
import type { QuestionCreateInput, QuestionUpdateInput } from "./types";
import type { QuestionFilters } from "./api";

const questionsKey = (filters: QuestionFilters) => ["admin", "questions", filters];

export function useQuestions(filters: QuestionFilters = {}) {
  return useQuery({
    queryKey: questionsKey(filters),
    queryFn: () => api.listQuestions(filters),
  });
}

export function useQuestion(questionId?: string) {
  return useQuery({
    queryKey: ["admin", "question", questionId],
    queryFn: () => api.getQuestion(questionId as string),
    enabled: Boolean(questionId),
  });
}

export function useCreateQuestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: QuestionCreateInput) => api.createQuestion(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "questions"] });
    },
  });
}

export function useUpdateQuestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      questionId,
      input,
    }: {
      questionId: string;
      input: QuestionUpdateInput;
    }) => api.updateQuestion(questionId, input),
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "questions"] });
      await queryClient.invalidateQueries({
        queryKey: ["admin", "question", variables.questionId],
      });
    },
  });
}

export function usePublishQuestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (questionId: string) => api.publishQuestion(questionId),
    onSuccess: async (_data, questionId) => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "questions"] });
      await queryClient.invalidateQueries({ queryKey: ["admin", "question", questionId] });
    },
  });
}

export function useUnpublishQuestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (questionId: string) => api.unpublishQuestion(questionId),
    onSuccess: async (_data, questionId) => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "questions"] });
      await queryClient.invalidateQueries({ queryKey: ["admin", "question", questionId] });
    },
  });
}

export function useBulkImportQuestions() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (items: QuestionCreateInput[]) => api.bulkImportQuestions(items),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "questions"] });
    },
  });
}
