import { useMutation, useQuery } from "@tanstack/react-query";
import * as api from "@/modules/student-payments/api";

export function usePlans() {
  return useQuery({
    queryKey: ["student", "plans"],
    queryFn: api.listPlans,
  });
}

export function usePlanOptions() {
  return useQuery({
    queryKey: ["student", "plans", "options"],
    queryFn: api.listPlanOptions,
  });
}

export function useCreateOrder() {
  return useMutation({
    mutationFn: (payload: { planId: string; couponCode?: string }) =>
      api.createOrder(payload),
  });
}

export function useOrderStatus(merchantTransactionId?: string) {
  return useQuery({
    queryKey: ["student", "payments", merchantTransactionId],
    queryFn: () => api.getOrderStatus(merchantTransactionId as string),
    enabled: Boolean(merchantTransactionId),
    refetchInterval: 3000,
  });
}
