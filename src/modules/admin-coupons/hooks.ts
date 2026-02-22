"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as api from "./api";
import type { AdminCouponInput, AdminCouponUpdateInput } from "./types";
import type { AdminCouponsQuery } from "./api";

const couponsKey = (query: AdminCouponsQuery) => [
  "admin",
  "coupons",
  query.isActive ?? "",
  query.page ?? 1,
  query.pageSize ?? 20,
];

export function useAdminCoupons(query: AdminCouponsQuery) {
  return useQuery({
    queryKey: couponsKey(query),
    queryFn: () => api.listAdminCoupons(query),
  });
}

export function useCreateAdminCoupon(query: AdminCouponsQuery) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AdminCouponInput) => api.createAdminCoupon(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: couponsKey(query) });
    },
  });
}

export function useUpdateAdminCoupon(query: AdminCouponsQuery) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      couponId,
      payload,
    }: {
      couponId: string;
      payload: AdminCouponUpdateInput;
    }) => api.updateAdminCoupon(couponId, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: couponsKey(query) });
    },
  });
}
