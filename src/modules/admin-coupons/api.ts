"use client";

import { apiFetch } from "@/lib/api/client";
import type {
  AdminCoupon,
  AdminCouponInput,
  AdminCouponList,
  AdminCouponUpdateInput,
} from "./types";

export type AdminCouponsQuery = {
  isActive?: string;
  page?: number;
  pageSize?: number;
};

function buildQuery(query: AdminCouponsQuery) {
  const params = new URLSearchParams();
  if (query.isActive) params.set("isActive", query.isActive);
  if (query.page) params.set("page", String(query.page));
  if (query.pageSize) params.set("pageSize", String(query.pageSize));
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export async function listAdminCoupons(query: AdminCouponsQuery) {
  return apiFetch<AdminCouponList>(`/admin/coupons${buildQuery(query)}`, {
    method: "GET",
  });
}

export async function createAdminCoupon(payload: AdminCouponInput) {
  return apiFetch<AdminCoupon>("/admin/coupons", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateAdminCoupon(
  couponId: string,
  payload: AdminCouponUpdateInput,
) {
  return apiFetch<AdminCoupon>(`/admin/coupons/${couponId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}
