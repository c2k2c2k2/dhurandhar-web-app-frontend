const STORAGE_KEY = "student_payment_context";

export function formatCurrency(paise: number) {
  const value = Number.isFinite(paise) ? paise / 100 : 0;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function storePaymentContext(payload: {
  merchantTransactionId: string;
  nextPath?: string;
}) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

export function loadPaymentContext(): {
  merchantTransactionId?: string;
  nextPath?: string;
} {
  if (typeof window === "undefined") return {};
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (!stored) return {};
  try {
    return JSON.parse(stored) as { merchantTransactionId?: string; nextPath?: string };
  } catch {
    return {};
  }
}

export function clearPaymentContext() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}
