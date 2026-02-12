"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as api from "./api";
import type { PaymentOrdersQuery } from "./api";

const ordersKey = (query: PaymentOrdersQuery) => [
  "admin",
  "payments",
  "orders",
  query.status ?? "",
  query.userId ?? "",
  query.from ?? "",
  query.to ?? "",
  query.page ?? 1,
  query.pageSize ?? 20,
];

export function usePaymentOrders(query: PaymentOrdersQuery) {
  return useQuery({
    queryKey: ordersKey(query),
    queryFn: () => api.listPaymentOrders(query),
  });
}

export function useFinalizePaymentOrder(query: PaymentOrdersQuery) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orderId: string) => api.finalizePaymentOrder(orderId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ordersKey(query) });
    },
  });
}
