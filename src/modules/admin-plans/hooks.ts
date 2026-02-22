"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as api from "./api";
import type { AdminPlanInput, AdminPlanUpdateInput } from "./types";
import type { AdminPlansQuery } from "./api";

const plansKey = (query: AdminPlansQuery) => [
  "admin",
  "plans",
  query.isActive ?? "",
  query.page ?? 1,
  query.pageSize ?? 20,
];

export function useAdminPlans(query: AdminPlansQuery) {
  return useQuery({
    queryKey: plansKey(query),
    queryFn: () => api.listAdminPlans(query),
  });
}

export function useCreateAdminPlan(query: AdminPlansQuery) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AdminPlanInput) => api.createAdminPlan(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: plansKey(query) });
      await queryClient.invalidateQueries({ queryKey: ["student", "plans"] });
      await queryClient.invalidateQueries({ queryKey: ["student", "plans", "options"] });
    },
  });
}

export function useUpdateAdminPlan(query: AdminPlansQuery) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      planId,
      payload,
    }: {
      planId: string;
      payload: AdminPlanUpdateInput;
    }) => api.updateAdminPlan(planId, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: plansKey(query) });
      await queryClient.invalidateQueries({ queryKey: ["student", "plans"] });
      await queryClient.invalidateQueries({ queryKey: ["student", "plans", "options"] });
    },
  });
}
