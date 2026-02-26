import { apiFetch } from "@/lib/api/client";
import type {
  CheckoutPreview,
  CheckoutResponse,
  PaymentOrder,
  StudentPlan,
  StudentPlanOption,
} from "@/modules/student-payments/types";

export async function listPlans() {
  return apiFetch<StudentPlan[]>("/plans", { method: "GET", auth: false });
}

export async function listPlanOptions() {
  return apiFetch<StudentPlanOption[]>("/plans/me/options", { method: "GET" });
}

export async function previewCheckout(payload: {
  planId: string;
  couponCode?: string;
  enableAutoPay?: boolean;
}) {
  return apiFetch<CheckoutPreview>("/payments/checkout/preview", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function createOrder(payload: {
  planId: string;
  couponCode?: string;
  enableAutoPay?: boolean;
}) {
  return apiFetch<CheckoutResponse>("/payments/checkout", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getOrderStatus(merchantTransactionId: string) {
  return apiFetch<PaymentOrder>(`/payments/orders/${merchantTransactionId}/status`, {
    method: "GET",
  });
}
