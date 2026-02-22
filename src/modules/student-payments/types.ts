export type StudentPlan = {
  id: string;
  key: string;
  name: string;
  tier?: string | null;
  pricePaise: number;
  durationDays: number;
  metadataJson?: Record<string, unknown> | null;
  featuresJson?: unknown;
  validity?: {
    unit: "DAYS" | "MONTHS" | "YEARS" | "LIFETIME";
    value?: number | null;
    durationDays: number;
    label: string;
  };
};

export type PlanPurchase = {
  canPurchase: boolean;
  mode: "NEW" | "RENEW" | "BLOCKED";
  reason?: string;
  message?: string;
  renewalWindowDays?: number;
  daysUntilExpiry?: number | null;
  renewalOpensAt?: string | null;
};

export type StudentPlanOption = StudentPlan & {
  purchase: PlanPurchase;
  activeSubscription?: {
    id: string;
    status: "ACTIVE" | "EXPIRED" | "CANCELLED" | "PENDING";
    startsAt?: string | null;
    endsAt?: string | null;
  } | null;
};

export type CheckoutResponse = {
  redirectUrl: string;
  merchantTransactionId: string;
  orderId: string;
  amountPaise: number;
};

export type PaymentOrder = {
  id: string;
  status: "CREATED" | "PENDING" | "SUCCESS" | "FAILED" | "EXPIRED" | "CANCELLED" | "REFUNDED";
  merchantTransactionId: string;
  amountPaise: number;
  finalAmountPaise: number;
  createdAt?: string;
  completedAt?: string | null;
};
