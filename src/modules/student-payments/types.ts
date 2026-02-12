export type StudentPlan = {
  id: string;
  key: string;
  name: string;
  tier?: string | null;
  pricePaise: number;
  durationDays: number;
  metadataJson?: Record<string, unknown> | null;
  featuresJson?: unknown;
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
