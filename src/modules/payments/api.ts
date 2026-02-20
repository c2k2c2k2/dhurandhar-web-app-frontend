"use client";

import { apiFetch } from "@/lib/api/client";
import type {
  PaymentOrderList,
  PaymentOrder,
  PaymentRefundRequest,
  PaymentRefundResult,
} from "./types";

export type PaymentOrdersQuery = {
  status?: string;
  userId?: string;
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
};

function buildQuery(query: PaymentOrdersQuery) {
  const params = new URLSearchParams();
  if (query.status) params.set("status", query.status);
  if (query.userId) params.set("userId", query.userId);
  if (query.from) params.set("from", query.from);
  if (query.to) params.set("to", query.to);
  if (query.page) params.set("page", String(query.page));
  if (query.pageSize) params.set("pageSize", String(query.pageSize));
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export async function listPaymentOrders(query: PaymentOrdersQuery) {
  return apiFetch<PaymentOrderList>(
    `/admin/payments/orders${buildQuery(query)}`,
    {
      method: "GET",
    },
  );
}

export async function finalizePaymentOrder(orderId: string) {
  return apiFetch<PaymentOrder>(`/admin/payments/orders/${orderId}/finalize`, {
    method: "POST",
  });
}

export async function refundPaymentOrder(
  orderId: string,
  payload: PaymentRefundRequest,
) {
  return apiFetch<PaymentRefundResult>(
    `/admin/payments/orders/${orderId}/refund`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

export async function getRefundStatus(merchantRefundId: string) {
  return apiFetch<PaymentRefundResult>(
    `/admin/payments/refunds/${merchantRefundId}/status`,
    {
      method: "GET",
    },
  );
}
