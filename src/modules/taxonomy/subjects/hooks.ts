"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as api from "./api";
import type { SubjectCreateInput, SubjectUpdateInput } from "./schemas";

const subjectsKey = ["admin", "subjects"];

export function useSubjects() {
  return useQuery({
    queryKey: subjectsKey,
    queryFn: api.listSubjects,
  });
}

export function useCreateSubject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: SubjectCreateInput) => api.createSubject(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: subjectsKey });
    },
  });
}

export function useUpdateSubject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      subjectId,
      input,
    }: {
      subjectId: string;
      input: SubjectUpdateInput;
    }) => api.updateSubject(subjectId, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: subjectsKey });
    },
  });
}
