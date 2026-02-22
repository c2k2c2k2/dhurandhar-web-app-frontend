import { apiFetch } from "@/lib/api/client";
import type {
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

export async function createOrder(payload: { planId: string; couponCode?: string }) {
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
