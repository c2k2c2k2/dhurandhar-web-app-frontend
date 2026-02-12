"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as api from "./api";
import type { TopicCreateInput, TopicUpdateInput } from "./schemas";

const topicsKey = (subjectId: string) => ["admin", "topics", subjectId];

export function useTopics(subjectId?: string) {
  return useQuery({
    queryKey: subjectId ? topicsKey(subjectId) : ["admin", "topics", "empty"],
    queryFn: () => api.listTopics(subjectId as string),
    enabled: Boolean(subjectId),
  });
}

export function useCreateTopic(subjectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: TopicCreateInput) => api.createTopic(subjectId, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: topicsKey(subjectId) });
    },
  });
}

export function useUpdateTopic(subjectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      topicId,
      input,
    }: {
      topicId: string;
      input: TopicUpdateInput;
    }) => api.updateTopic(topicId, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: topicsKey(subjectId) });
    },
  });
}
